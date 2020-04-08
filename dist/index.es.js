import { pipe, of, isObservable, from, Subject, merge, EMPTY, NEVER, combineLatest } from 'rxjs';
import { catchError, scan, filter, map, tap, share, switchMap, mergeMap, concatMap, exhaustMap, startWith, takeUntil, shareReplay } from 'rxjs/operators';

var FlattenOperator;
(function (FlattenOperator) {
    FlattenOperator["switchMap"] = "switchMap";
    FlattenOperator["mergeMap"] = "mergeMap";
    FlattenOperator["concatMap"] = "concatMap";
    FlattenOperator["exhaustMap"] = "exhaustMap";
})(FlattenOperator || (FlattenOperator = {}));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

var isObject = function (value) { return value !== null && typeof value === 'object'; };
var compose = function (fns) { return fns.reduce(function (f, g) { return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return f(g.apply(void 0, __spread(args)));
}; }); };
var catchErr = pipe(catchError(function (e) { return of(e); }));
var flatCatch = function (o) { return o.pipe(catchErr); };
var mapToObservable = function (value) {
    if (isObservable(value))
        return value;
    if (value instanceof Promise)
        return from(value);
    return of(value);
};

function reducerFactory$(_a) {
    var _b = __read(_a, 3), initialState = _b[0], reducer = _b[1], middleware = _b[2];
    function _reducer(state, action) {
        return middleware.length > 0
            ? compose(middleware)(reducer)(state, action)
            : reducer(state, action);
    }
    return scan(_reducer, initialState);
}

var fop = {
    switchMap: switchMap,
    mergeMap: mergeMap,
    concatMap: concatMap,
    exhaustMap: exhaustMap,
};
function getDefaults(config, options, dispatchSubject) {
    if (config === void 0) { config = {}; }
    if (options === void 0) { options = {}; }
    var reducer$ = (config && config.reducer$ && config.reducer$.pipe(catchErr)) ||
        of(function (state, action) { return state; });
    var actions$ = new Subject();
    var actionStream$ = function (reducer$) {
        return merge((config && config.actionStream$ && config.actionStream$.pipe(catchErr)) || EMPTY, dispatchSubject).pipe(filter(isObject), map(mapToObservable), actionFlatten(flatCatch), tap(actions$), reducer$, map(mapToObservable));
    };
    var initialState$ = ((config && config.initialState$ && config.initialState$.pipe(catchErr)) ||
        of({})).pipe(share());
    var middleware$ = (config && config.middleware$ && config.middleware$.pipe(catchErr)) ||
        of([]);
    var destroy$ = (config && config.destroy$ && config.destroy$.pipe(catchErr)) || NEVER;
    var actionFlatten = fop[(options && options.actionFlatOp) || FlattenOperator.concatMap];
    var stateFlatten = fop[(options && options.stateFlatOp) || FlattenOperator.switchMap];
    var flattenState$ = function (source) {
        return source.pipe(stateFlatten(flatCatch), map(mapToObservable), stateFlatten(flatCatch));
    };
    var bufferSize = (options && options.bufferSize) || 1;
    var windowTime = options && options.windowTime;
    var shareReplayConfig = {
        refCount: false,
        bufferSize: bufferSize,
        windowTime: windowTime,
    };
    return {
        reducer$: reducer$,
        actions$: actions$,
        actionStream$: actionStream$,
        initialState$: initialState$,
        middleware$: middleware$,
        destroy$: destroy$,
        flattenState$: flattenState$,
        shareReplayConfig: shareReplayConfig,
    };
}

/**
 * Reactive state container based on RxJS (https://rxjs.dev/)
 *
 * @class AsyncStore<State, ActionsUnion>
 *
 * @type State - application state interface
 * @type ActionsUnion - type union of all the actions
 */
var Store = /** @class */ (function () {
    /**
     * Default configuration
     *
     * @param {Object} config
     *  {
     *     reducer$: of(reducer({})),
     *     actionStream$: EMPTY, // if not defined, no actions will be dispatched in the store
     *     initialState$: of({}),
     *     middleware$: of([]),
     *     destroy$: NEVER // if not defined, the state subscription will live forever
     *  }
     *
     * @param {Object} options
     *  {
     *     actionFop: FlattenOps.concatMap, // Flatten operator for actions's stream.
     *     stateFop: FlattenOps.switchMap // Flatten operator for state's stream.
     *     windowTime: undefined //Maximum time length of the replay buffer in milliseconds.
     *     bufferSize: 1 //Maximum element count of the replay buffer.
     *  }
     */
    function Store(config, options) {
        var _this = this;
        this.config = config;
        this.options = options;
        this._dispatch$ = new Subject();
        this.dispatch = function (action) {
            _this._dispatch$.next(action);
        };
        var _a = getDefaults(this.config, this.options, this._dispatch$), reducer$ = _a.reducer$, actions$ = _a.actions$, actionStream$ = _a.actionStream$, middleware$ = _a.middleware$, initialState$ = _a.initialState$, destroy$ = _a.destroy$, flattenState$ = _a.flattenState$, shareReplayConfig = _a.shareReplayConfig;
        this.state$ = combineLatest(initialState$, reducer$, middleware$).pipe(map(reducerFactory$), concatMap(actionStream$), startWith(initialState$), flattenState$, takeUntil(destroy$), shareReplay(shareReplayConfig));
        this.state$.subscribe();
        this.actions$ = actions$.pipe(shareReplay(shareReplayConfig));
    }
    return Store;
}());
function createStore(config, opts) {
    if (config === void 0) { config = {}; }
    if (opts === void 0) { opts = {}; }
    return new Store(config, opts);
}

/**
 *
 * @param mapFn - a function to map a state with
 * @returns {MiddlewareFn} MiddlewareFn<State>
 *
 * PS - previous state
 * NS - next state
 */
var mapPS = function (mapFn) { return function (reducer) { return function (state, Action) { return reducer(mapFn(state), Action); }; }; };
var mapNS = function (mapFn) { return function (reducer) { return function (state, Action) { return mapFn(reducer(state, Action)); }; }; };
/**
 *
 * @param mapFn - a function to map an Action with
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
var mapA = function (mapFn) { return function (reducer) { return function (state, Action) { return reducer(state, mapFn(Action)); }; }; };
/**
 *
 * @param filterFn - a function to filter a state with
 * @returns {MiddlewareFn} MiddlewareFn<State>
 *
 * PS - previous state
 * NS - next state
 */
var filterPS = function (filterFn) { return function (reducer) { return function (state, Action) {
    return filterFn(state) ? reducer(state, Action) : state;
}; }; };
var filterNS = function (filterFn) { return function (reducer) { return function (state, Action) {
    var nextState = reducer(state, Action);
    return filterFn(nextState) ? nextState : state;
}; }; };
/**
 *
 * @param filterFn - a function to filter an Action with
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
var filterA = function (filterFn) { return function (reducer) { return function (state, Action) {
    return filterFn(Action) ? reducer(state, Action) : state;
}; }; };
/**
 * Reduce into state
 * @param reduceFn - a function to reduce the state and Action together
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 *
 * PS - previous state
 * NS - next state
 */
var reducePS = function (reducerFn) { return function (reducer) { return function (state, Action) {
    return reducer(reducerFn(state, Action), Action);
}; }; };
var reduceNS = function (reducerFn) { return function (reducer) { return function (state, Action) {
    return reducerFn(reducer(state, Action), Action);
}; }; };
/**
 *
 * Reduce into Action
 * @param reduceFn - a function to reduce the state and Action together
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
var reduceA = function (reducerFn) { return function (reducer) { return function (state, Action) {
    return reducer(state, reducerFn(state, Action));
}; }; };

export { FlattenOperator, Store, catchErr, createStore, filterA, filterNS, filterPS, flatCatch, mapA, mapNS, mapPS, mapToObservable, reduceA, reduceNS, reducePS };
