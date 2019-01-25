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

const compose = (fns) => fns.reduce((f, g) => (...args) => f(g(...args)));
const catchErr = rxjs.pipe(operators.catchError(e => rxjs.of(e)));
const mapToObservable = rxjs.pipe(operators.map(value => value instanceof Promise || value instanceof rxjs.Observable
    ? rxjs.from(value)
    : rxjs.of(value)));

function reducerFactory(actionMap, metaReducersMap) {
    const metaReducers = Object.keys(metaReducersMap).map(key => metaReducersMap[key]);
    const hasMeta = metaReducers.length > 0;
    const _actionMap = new Map();
    Object.keys(actionMap)
        .map(k => [k, new actionMap[k]().runWith])
        .forEach(([key, value]) => _actionMap.set(key, value));
    return (state, action) => {
        if (!(action.type && _actionMap.has(action.type)))
            return state;
        const reducerFn = _actionMap.get(action.type) || ((state) => state);
        return hasMeta
            ? compose(metaReducers)(reducerFn)(state, action)
            : reducerFn(state, action);
    };
}

/**
 * State container based on RxJS observables
 *
 *
 *
 * @class AsyncStore<State, ActionsUnion>
 */
class AsyncStore {
    constructor(config, options) {
        this.config = config;
        this.options = options;
        this.flattenOp = {
            switchMap: operators.switchMap,
            mergeMap: operators.mergeMap,
            concatMap: operators.concatMap,
            exhaustMap: operators.exhaustMap
        };
        const actionFop = this.flattenOp[(this.options && this.options.actionFop) || exports.FlattenOps.concatMap];
        const stateFop = this.flattenOp[(this.options && this.options.stateFop) || exports.FlattenOps.switchMap];
        this.state$ = rxjs.combineLatest(this.config.initialState$.pipe(catchErr), this.config.actionMap$.pipe(catchErr), this.config.metaMap$.pipe(catchErr)).pipe(operators.map(([i, a, m]) => operators.scan(reducerFactory(a, m), i)), operators.switchMap(reducer => this.config.actionQ$.pipe(operators.filter(a => !!a), mapToObservable, actionFop((a) => a.pipe(catchErr)), reducer, mapToObservable)), operators.startWith(this.config.initialState$), stateFop((state) => state.pipe(catchErr)), operators.takeUntil(this.config.onDestroy$), operators.shareReplay(1));
        this.state$.subscribe();
    }
}

function isEqualCheck(a, b) {
    return a === b;
}
function isArgumentsChanged(args, lastArguments, comparator) {
    for (let i = 0; i < args.length; i++) {
        if (!comparator(args[i], lastArguments[i])) {
            return true;
        }
    }
    return false;
}
// function resultMemoize(
//   projectionFn: AnyFn,
//   isResultEqual: ComparatorFn
// ) {
//   return defaultMemoize(projectionFn, isEqualCheck, isResultEqual);
// }
function defaultMemoize(projectionFn, isArgumentsEqual = isEqualCheck, isResultEqual = isEqualCheck) {
    let lastArguments = null;
    // tslint:disable-next-line:no-any anything could be the result.
    let lastResult = null;
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
        const newResult = projectionFn.apply(null, arguments);
        if (isResultEqual(lastResult, newResult)) {
            return lastResult;
        }
        lastResult = newResult;
        lastArguments = arguments;
        return newResult;
    }
    return { memoized, reset };
}
function createSelector(...input) {
    return createSelectorFactory(defaultMemoize)(...input);
}
function defaultStateFn(state, selectors, props, memoizedProjector) {
    if (props === undefined) {
        const args = selectors.map(fn => fn(state));
        return memoizedProjector.memoized.apply(null, args);
    }
    const args = selectors.map(fn => fn(state, props));
    return memoizedProjector.memoized.apply(null, [...args, props]);
}
function createSelectorFactory(memoize, options = {
    stateFn: defaultStateFn
}) {
    return function (...input) {
        let args = input;
        if (Array.isArray(args[0])) {
            const [head, ...tail] = args;
            args = [...head, ...tail];
        }
        const selectors = args.slice(0, args.length - 1);
        const projector = args[args.length - 1];
        const memoizedSelectors = selectors.filter((selector) => selector.release && typeof selector.release === 'function');
        const memoizedProjector = memoize(function (...selectors) {
            return projector.apply(null, selectors);
        });
        const memoizedState = defaultMemoize(function (state, props) {
            // createSelector works directly on state
            // e.g. createSelector((state, props) => ...)
            if (selectors.length === 0) {
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
            memoizedSelectors.forEach(selector => selector.release());
        }
        return Object.assign(memoizedState.memoized, {
            release,
            projector: memoizedProjector.memoized
        });
    };
}
function select(pathOrMapFn, propsOrPath, ...paths) {
    return function selectOperator(source$) {
        let mapped$;
        if (typeof pathOrMapFn === 'string') {
            const pathSlices = [propsOrPath, ...paths].filter(Boolean);
            mapped$ = source$.pipe(operators.pluck(pathOrMapFn, ...pathSlices));
        }
        else if (typeof pathOrMapFn === 'function') {
            mapped$ = source$.pipe(operators.map(source => pathOrMapFn(source, propsOrPath)));
        }
        else {
            throw new TypeError(`Unexpected type '${typeof pathOrMapFn}' in select operator,` +
                ` expected 'string' or 'function'`);
        }
        return mapped$.pipe(operators.distinctUntilChanged());
    };
}
function ofType(...allowedTypes) {
    return operators.filter((action) => allowedTypes.some(type => type === action.type));
}

class ActionMonad {
    constructor(payload) {
        this.payload = payload;
        this.type = '';
        Object.defineProperty(this, 'type', {
            get: () => this.constructor.name
        });
    }
}

exports.createSelector = createSelector;
exports.ofType = ofType;
exports.select = select;
exports.AsyncStore = AsyncStore;
exports.ActionMonad = ActionMonad;
exports.compose = compose;
exports.catchErr = catchErr;
exports.mapToObservable = mapToObservable;
