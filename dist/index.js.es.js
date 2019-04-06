import { pluck, map, distinctUntilChanged, catchError, filter, scan, switchMap, mergeMap, concatMap, exhaustMap, startWith, takeUntil, shareReplay } from 'rxjs/operators';
import { pipe, of, isObservable, from, EMPTY, NEVER, queueScheduler, asapScheduler, animationFrameScheduler, asyncScheduler, combineLatest } from 'rxjs';
import { AnimationFrameScheduler } from 'rxjs/internal/scheduler/AnimationFrameScheduler';

var FlattenOperator;
(function (FlattenOperator) {
    FlattenOperator["switchMap"] = "switchMap";
    FlattenOperator["mergeMap"] = "mergeMap";
    FlattenOperator["concatMap"] = "concatMap";
    FlattenOperator["exhaustMap"] = "exhaustMap";
})(FlattenOperator || (FlattenOperator = {}));
var Scheduler;
(function (Scheduler) {
    Scheduler["queue"] = "queueScheduler";
    Scheduler["asap"] = "asapScheduler";
    Scheduler["animationFrame"] = "animationFrameScheduler";
    Scheduler["async"] = "asyncScheduler";
})(Scheduler || (Scheduler = {}));

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

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

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
var hasType = function (action) { return typeof action.type === 'string'; };
var isValidAction = function (action, map$$1) {
    return hasType(action) &&
        map$$1.hasOwnProperty(action.type) &&
        typeof map$$1[action.type] === 'function';
};
var _pipe = function (fns) {
    return fns.reduceRight(function (f, g) { return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return f(g.apply(void 0, __spread(args)));
    }; });
};
var catchErr = pipe(catchError(function (e) { return of(e); }));
var flattenObservable = function (o) { return o.pipe(catchErr); };
var mapToObservable = function () {
    return pipe(map(function (value) {
        if (isObservable(value))
            return value;
        if (value instanceof Promise)
            return from(value);
        return of(value);
    }));
};
function ofType() {
    var allowedTypes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        allowedTypes[_i] = arguments[_i];
    }
    return filter(function (action) {
        return allowedTypes.some(function (type) { return type === action.type; });
    });
}

function reducerFactory(_a) {
    var _b = __read(_a, 3), actionMap = _b[0], transducerMap = _b[1], initialState = _b[2];
    var transducers = Object.keys(transducerMap).map(function (key) { return transducerMap[key]; });
    var hasT = transducers.length > 0;
    var _actionMap = __assign({}, actionMap);
    var reducer = function (state, action) {
        if (!isValidAction(action, _actionMap))
            return state;
        var actionReducer = _actionMap[action.type];
        return hasT
            ? _pipe(transducers)(actionReducer)(state, action)
            : actionReducer(state, action);
    };
    return scan(reducer, initialState);
}

// flatten: FlattenOperator from ./interfaces
function actionFactory(actions$, flatten) {
    return function (reducer) {
        return actions$.pipe(filter(isObject), mapToObservable(), flatten(flattenObservable), reducer, mapToObservable());
    };
}

var fop = {
    switchMap: switchMap,
    mergeMap: mergeMap,
    concatMap: concatMap,
    exhaustMap: exhaustMap
};
var sched = {
    queueScheduler: queueScheduler,
    asapScheduler: asapScheduler,
    animationFrameScheduler: animationFrameScheduler,
    asyncScheduler: asyncScheduler
};
var isWindow = typeof window !== 'undefined' && !!window;
function getDefaults(config, options) {
    if (config === void 0) { config = {}; }
    if (options === void 0) { options = {}; }
    var actionMap$ = (config && config.actionMap$ && config.actionMap$.pipe(catchErr)) || of({});
    var actions$ = (config && config.actions$ && config.actions$.pipe(catchErr)) || EMPTY;
    var initialState$ = (config && config.initialState$ && config.initialState$.pipe(catchErr)) ||
        of({});
    var transducers$ = (config &&
        config.transducers$ &&
        config.transducers$.pipe(catchErr)) ||
        of({});
    var destroy$ = (config && config.destroy$ && config.destroy$.pipe(catchErr)) || NEVER;
    var actionFop = fop[(options && options.actionFop) || FlattenOperator.concatMap];
    var actionFactory$ = actionFactory(actions$, actionFop);
    var stateFop = fop[(options && options.stateFop) || FlattenOperator.switchMap];
    var scheduler = sched[(options && options.scheduler) || Scheduler.queue];
    var isAnimationSched = scheduler instanceof AnimationFrameScheduler;
    var flattenState$ = function (fo) {
        if (fo === void 0) { fo = flattenObservable; }
        return function (source) { return source.pipe(stateFop(flattenObservable)); };
    };
    var returnDefault = function () {
        console.warn("\n  AnimationFrameScheduler can be used only in the browser.\n  Setting scheduler back to queue(default).\n");
        return sched[Scheduler.queue];
    };
    var shareReplayConfig = {
        refCount: true,
        bufferSize: (options && options.bufferSize) || 1,
        scheduler: !isWindow && isAnimationSched ? returnDefault() : scheduler,
        windowTime: (options && options.windowTime) || undefined
    };
    return {
        actionMap$: actionMap$,
        initialState$: initialState$,
        transducers$: transducers$,
        destroy$: destroy$,
        actionFactory$: actionFactory$,
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
     *     actionMap$: of({}),
     *     actions$: EMPTY, //(if not defined, no actions will be dispatched in the store)
     *     initialState$: of({}),
     *     metaReducers$: of({}),
     *     destroy$: NEVER //(if not defined, the state subscription will live forever)
     *  }
     *
     * @param {Object} options
     *  {
     *     actionFop: FlattenOps.concatMap, //(actions are executed in order of propagation)
     *     stateFop: FlattenOps.switchMap //(will update to the latest received state, without waiting for previous async operations to finish)
     *     scheduler: Scheduler.queue,
     *     windowTime: undefined
     *  }
     */
    function Store(config, options) {
        this.config = config;
        this.options = options;
        var _a = getDefaults(this.config, this.options), actionMap$ = _a.actionMap$, transducers$ = _a.transducers$, actionFactory$ = _a.actionFactory$, initialState$ = _a.initialState$, flattenState$ = _a.flattenState$, destroy$ = _a.destroy$, shareReplayConfig = _a.shareReplayConfig;
        this.state$ = combineLatest(actionMap$, transducers$, initialState$).pipe(map(reducerFactory), switchMap(actionFactory$), startWith(initialState$), flattenState$(), takeUntil(destroy$), shareReplay(shareReplayConfig));
        this.state$.subscribe();
    }
    return Store;
}());
function createStore(config, opts) {
    if (config === void 0) { config = {}; }
    if (opts === void 0) { opts = {}; }
    return new Store(config, opts);
}
var state$ = createStore().state$;
state$.subscribe(console.log);

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
 *
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
 * @param reduceFn - a function to reduce the state and action together
 * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
 */
var reduceA = function (reducerFn) { return function (reducer) { return function (state, action) {
    return reducer(state, reducerFn(state, action));
}; }; };

var Action = /** @class */ (function () {
    function Action(payload) {
        this.payload = payload;
    }
    Object.defineProperty(Action.prototype, "type", {
        get: function () {
            return this.constructor.name;
        },
        enumerable: true,
        configurable: true
    });
    return Action;
}());

export { FlattenOperator, Scheduler, createSelector, select, Store, createStore, mapToObservable, ofType, catchErr, Action, mapPS, mapNS, mapA, filterPS, filterNS, filterA, reducePS, reduceNS, reduceA };