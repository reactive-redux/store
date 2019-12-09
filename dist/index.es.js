import { pluck, map, distinctUntilChanged, catchError, scan, filter, tap, share, switchMap, mergeMap, concatMap, exhaustMap, startWith, takeUntil, shareReplay } from 'rxjs/operators';
import { pipe, of, isObservable, from, Subject, EMPTY, NEVER, combineLatest } from 'rxjs';
import { reducer } from 'ts-action';
export * from 'ts-action';

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

function isEqualCheck(a, b) {
    return a === b;
}
function isArgumentsChanged(args, lastArguments, comparator) {
    for (var i = 0; i < args.length; i++) {
        if (!comparator(args[i], lastArguments[i])) {
            return true;
        }
    }
    return false;
}
function defaultMemoize(projectionFn, isArgumentsEqual, isResultEqual) {
    if (isArgumentsEqual === void 0) { isArgumentsEqual = isEqualCheck; }
    if (isResultEqual === void 0) { isResultEqual = isEqualCheck; }
    var lastArguments = null;
    // tslint:disable-next-line:no-any anything could be the result.
    var lastResult = null;
    function reset() {
        lastArguments = null;
        lastResult = null;
    }
    // tslint:disable-next-line:no-any anything could be the result.
    function memoized() {
        if (!lastArguments) {
            lastResult = projectionFn.apply(null, arguments);
            lastArguments = arguments;
            return lastResult;
        }
        if (!isArgumentsChanged(arguments, lastArguments, isArgumentsEqual)) {
            return lastResult;
        }
        lastArguments = arguments;
        var newResult = projectionFn.apply(null, arguments);
        if (isResultEqual(lastResult, newResult)) {
            return lastResult;
        }
        lastResult = newResult;
        return newResult;
    }
    return { memoized: memoized, reset: reset };
}
function createSelector() {
    var input = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        input[_i] = arguments[_i];
    }
    return createSelectorFactory(defaultMemoize).apply(void 0, __spread(input));
}
function defaultStateFn(state, selectors, props, memoizedProjector) {
    if (props === undefined) {
        var args_1 = selectors.map(function (fn) { return fn(state); });
        return memoizedProjector.memoized.apply(null, args_1);
    }
    var args = selectors.map(function (fn) {
        return fn(state, props);
    });
    return memoizedProjector.memoized.apply(null, __spread(args, [props]));
}
function createSelectorFactory(memoize, options) {
    if (options === void 0) { options = {
        stateFn: defaultStateFn
    }; }
    return function () {
        var input = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            input[_i] = arguments[_i];
        }
        var args = input;
        if (Array.isArray(args[0])) {
            var _a = __read(args), head = _a[0], tail = _a.slice(1);
            args = __spread(head, tail);
        }
        var selectors = args.slice(0, args.length - 1);
        var projector = args[args.length - 1];
        var memoizedSelectors = selectors.filter(function (selector) { return selector.release && typeof selector.release === 'function'; });
        var memoizedProjector = memoize(function () {
            var selectors = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                selectors[_i] = arguments[_i];
            }
            return projector.apply(null, selectors);
        });
        var memoizedState = defaultMemoize(function (state, props) {
            // createSelector works directly on state
            // e.g. createSelector((state, props) => ...)
            if (selectors.length === 0 && props !== undefined) {
                return projector.apply(null, [state, props]);
            }
            return options.stateFn.apply(null, [
                state,
                selectors,
                props,
                memoizedProjector
            ]);
        });
        function release() {
            memoizedState.reset();
            memoizedProjector.reset();
            memoizedSelectors.forEach(function (selector) { return selector.release(); });
        }
        return Object.assign(memoizedState.memoized, {
            release: release,
            projector: memoizedProjector.memoized
        });
    };
}
function select(pathOrMapFn, propsOrPath) {
    var paths = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        paths[_i - 2] = arguments[_i];
    }
    return function selectOperator(source$) {
        var mapped$;
        if (typeof pathOrMapFn === 'string') {
            var pathSlices = __spread([propsOrPath], paths).filter(Boolean);
            mapped$ = source$.pipe(pluck.apply(void 0, __spread([pathOrMapFn], pathSlices)));
        }
        else if (typeof pathOrMapFn === 'function') {
            mapped$ = source$.pipe(map(function (source) { return pathOrMapFn(source, propsOrPath); }));
        }
        else {
            throw new TypeError("Unexpected type '" + typeof pathOrMapFn + "' in select operator," +
                " expected 'string' or 'function'");
        }
        return mapped$.pipe(distinctUntilChanged());
    };
}

var isObject = function (value) { return value !== null && typeof value === 'object'; };
var _pipe = function (fns) {
    return fns.reduce(function (f, g) { return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return f(g.apply(void 0, __spread(args)));
    }; });
};
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
    var _b = __read(_a, 3), initialState = _b[0], reducer = _b[1], transducers = _b[2];
    function _reducer(state, action) {
        return transducers.length > 0
            ? _pipe(transducers)(reducer)(state, action)
            : reducer(state, action);
    }
    return scan(_reducer, initialState);
}

var fop = {
    switchMap: switchMap,
    mergeMap: mergeMap,
    concatMap: concatMap,
    exhaustMap: exhaustMap
};
function getDefaults(config, options) {
    if (config === void 0) { config = {}; }
    if (options === void 0) { options = {}; }
    var reducer$ = (config && config.reducer$ && config.reducer$.pipe(catchErr)) ||
        of(reducer({}));
    var actions$ = new Subject();
    var actionStream$ = function (reducer$) {
        return ((config && config.actionStream$ && config.actionStream$.pipe(catchErr)) ||
            EMPTY).pipe(filter(isObject), map(mapToObservable), actionFlatten(flatCatch), tap(actions$), reducer$, map(mapToObservable));
    };
    var initialState$ = ((config && config.initialState$ && config.initialState$.pipe(catchErr)) ||
        of({})).pipe(share());
    var transducers$ = (config &&
        config.transducers$ &&
        config.transducers$.pipe(catchErr)) ||
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
        windowTime: windowTime
    };
    return {
        reducer$: reducer$,
        actions$: actions$,
        actionStream$: actionStream$,
        initialState$: initialState$,
        transducers$: transducers$,
        destroy$: destroy$,
        flattenState$: flattenState$,
        shareReplayConfig: shareReplayConfig
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
     *     transducers$: of([]),
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
        this.config = config;
        this.options = options;
        var _a = getDefaults(this.config, this.options), reducer$ = _a.reducer$, actions$ = _a.actions$, actionStream$ = _a.actionStream$, transducers$ = _a.transducers$, initialState$ = _a.initialState$, destroy$ = _a.destroy$, flattenState$ = _a.flattenState$, shareReplayConfig = _a.shareReplayConfig;
        this.state$ = combineLatest(initialState$, reducer$, transducers$).pipe(map(reducerFactory$), concatMap(actionStream$), startWith(initialState$), flattenState$, takeUntil(destroy$), shareReplay(shareReplayConfig));
        this.state$.subscribe();
        this.actions$ = actions$.pipe(shareReplay(shareReplayConfig));
    }
    return Store;
}());

/**
 *
 * @param mapFn - a function to map a state with
 * @returns {TransducerFn} TransducerFn<State>
 *
 * PS - previous state
 * NS - next state
 */
var mapPS = function (mapFn) { return function (reducer) { return function (state, action) { return reducer(mapFn(state), action); }; }; };
var mapNS = function (mapFn) { return function (reducer) { return function (state, action) { return mapFn(reducer(state, action)); }; }; };
/**
 *
 * @param mapFn - a function to map an action with
 * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
 */
var mapA = function (mapFn) { return function (reducer) { return function (state, action) { return reducer(state, mapFn(action)); }; }; };
/**
 *
 * @param filterFn - a function to filter a state with
 * @returns {TransducerFn} TransducerFn<State>
 *
 * PS - previous state
 * NS - next state
 */
var filterPS = function (filterFn) { return function (reducer) { return function (state, action) {
    return filterFn(state) ? reducer(state, action) : state;
}; }; };
var filterNS = function (filterFn) { return function (reducer) { return function (state, action) {
    var nextState = reducer(state, action);
    return filterFn(nextState) ? nextState : state;
}; }; };
/**
 *
 * @param filterFn - a function to filter an action with
 * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
 */
var filterA = function (filterFn) { return function (reducer) { return function (state, action) {
    return filterFn(action) ? reducer(state, action) : state;
}; }; };
/**
 * Reduce into state
 * @param reduceFn - a function to reduce the state and action together
 * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
 *
 * PS - previous state
 * NS - next state
 */
var reducePS = function (reducerFn) { return function (reducer) { return function (state, action) {
    return reducer(reducerFn(state, action), action);
}; }; };
var reduceNS = function (reducerFn) { return function (reducer) { return function (state, action) {
    return reducerFn(reducer(state, action), action);
}; }; };
/**
 *
 * Reduce into action
 * @param reduceFn - a function to reduce the state and action together
 * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
 */
var reduceA = function (reducerFn) { return function (reducer) { return function (state, action) {
    return reducer(state, reducerFn(state, action));
}; }; };

export { FlattenOperator, Store, catchErr, createSelector, filterA, filterNS, filterPS, mapA, mapNS, mapPS, mapToObservable, reduceA, reduceNS, reducePS, select };
