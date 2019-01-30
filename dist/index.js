'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var rxjs = require('rxjs');
var operators = require('rxjs/operators');

(function (FlattenOps) {
    FlattenOps["switchMap"] = "switchMap";
    FlattenOps["mergeMap"] = "mergeMap";
    FlattenOps["concatMap"] = "concatMap";
    FlattenOps["exhaustMap"] = "exhaustMap";
})(exports.FlattenOps || (exports.FlattenOps = {}));

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

var compose = function (fns) {
    return fns.reduce(function (f, g) { return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return f(g.apply(void 0, __spread(args)));
    }; });
};
var catchErr = rxjs.pipe(operators.catchError(function (e) { return rxjs.of(e); }));
var mapToObservable = rxjs.pipe(operators.map(function (value) {
    return value instanceof Promise || value instanceof rxjs.Observable
        ? rxjs.from(value)
        : rxjs.of(value);
}));

function reducerFactory(metaReducersMap) {
    var metaReducers = Object.keys(metaReducersMap).map(function (key) { return metaReducersMap[key]; });
    var hasMeta = metaReducers.length > 0;
    return function (state, action) {
        if (!(action.type &&
            action.runWith &&
            typeof action.runWith === 'function'))
            return state;
        return hasMeta
            ? compose(metaReducers)(action.runWith)(state)
            : action.runWith(state);
    };
}

/**
 * State container based on RxJS observables
 *
 *
 *
 * @class AsyncStore<State, ActionsUnion>
 */
var AsyncStore = /** @class */ (function () {
    function AsyncStore(config, options) {
        var _this = this;
        this.config = config;
        this.options = options;
        this.flattenOp = {
            switchMap: operators.switchMap,
            mergeMap: operators.mergeMap,
            concatMap: operators.concatMap,
            exhaustMap: operators.exhaustMap
        };
        var actionFop = this.flattenOp[(this.options && this.options.actionFop) || exports.FlattenOps.concatMap];
        var stateFop = this.flattenOp[(this.options && this.options.stateFop) || exports.FlattenOps.switchMap];
        this.state$ = rxjs.combineLatest(this.config.initialState$.pipe(catchErr), this.config.metaMap$.pipe(catchErr)).pipe(operators.map(function (_a) {
            var _b = __read(_a, 2), i = _b[0], m = _b[1];
            return operators.scan(reducerFactory(m), i);
        }), operators.switchMap(function (reducer) {
            return _this.config.actionQ$.pipe(operators.filter(function (a) { return !!a; }), mapToObservable, actionFop(function (a) { return a.pipe(catchErr); }), reducer, mapToObservable);
        }), operators.startWith(this.config.initialState$), stateFop(function (state) { return state.pipe(catchErr); }), operators.takeUntil(this.config.onDestroy$), operators.shareReplay(1));
        this.state$.subscribe();
    }
    return AsyncStore;
}());

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
        var memoizedSelectors = selectors.filter(function (selector) {
            return selector.release && typeof selector.release === 'function';
        });
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
            mapped$ = source$.pipe(operators.pluck.apply(void 0, __spread([pathOrMapFn], pathSlices)));
        }
        else if (typeof pathOrMapFn === 'function') {
            mapped$ = source$.pipe(operators.map(function (source) { return pathOrMapFn(source, propsOrPath); }));
        }
        else {
            throw new TypeError("Unexpected type '" + typeof pathOrMapFn + "' in select operator," +
                " expected 'string' or 'function'");
        }
        return mapped$.pipe(operators.distinctUntilChanged());
    };
}
function ofType() {
    var allowedTypes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        allowedTypes[_i] = arguments[_i];
    }
    return operators.filter(function (action) {
        return allowedTypes.some(function (type) { return type === action.type; });
    });
}

var ActionMonad = /** @class */ (function () {
    function ActionMonad(payload) {
        var _this = this;
        this.payload = payload;
        this.type = '';
        Object.defineProperty(this, 'type', {
            get: function () { return _this.constructor.name; }
        });
    }
    return ActionMonad;
}());

exports.createSelector = createSelector;
exports.ofType = ofType;
exports.select = select;
exports.AsyncStore = AsyncStore;
exports.ActionMonad = ActionMonad;
exports.compose = compose;
exports.catchErr = catchErr;
exports.mapToObservable = mapToObservable;
