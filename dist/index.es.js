export { createSelector, createSelectorCreator, createStructuredSelector, defaultMemoize } from 'reselect';
import { pipe, of, isObservable, from, Subject, EMPTY, NEVER, combineLatest } from 'rxjs';
import { catchError, scan, filter, map, tap, share, switchMap, mergeMap, concatMap, exhaustMap, startWith, takeUntil, shareReplay } from 'rxjs/operators';
import { reducer } from 'ts-action';
export * from 'ts-action';

var FlattenOperator;
(function (FlattenOperator) {
    FlattenOperator["switchMap"] = "switchMap";
    FlattenOperator["mergeMap"] = "mergeMap";
    FlattenOperator["concatMap"] = "concatMap";
    FlattenOperator["exhaustMap"] = "exhaustMap";
})(FlattenOperator || (FlattenOperator = {}));

const isObject = (value) => value !== null && typeof value === 'object';
const compose = (fns) => fns.reduce((f, g) => (...args) => f(g(...args)));
const catchErr = pipe(catchError(e => of(e)));
const flatCatch = (o) => o.pipe(catchErr);
const mapToObservable = (value) => {
    if (isObservable(value))
        return value;
    if (value instanceof Promise)
        return from(value);
    return of(value);
};

function reducerFactory$([initialState, reducer, middleware,]) {
    function _reducer(state, action) {
        return middleware.length > 0
            ? compose(middleware)(reducer)(state, action)
            : reducer(state, action);
    }
    return scan(_reducer, initialState);
}

const fop = {
    switchMap,
    mergeMap,
    concatMap,
    exhaustMap
};
function getDefaults(config = {}, options = {}) {
    const reducer$ = (config && config.reducer$ && config.reducer$.pipe(catchErr)) ||
        of(reducer({}));
    const actions$ = new Subject();
    const actionStream$ = reducer$ => ((config && config.actionStream$ && config.actionStream$.pipe(catchErr)) ||
        EMPTY).pipe(filter(isObject), map(mapToObservable), actionFlatten(flatCatch), tap(actions$), reducer$, map(mapToObservable));
    const initialState$ = ((config && config.initialState$ && config.initialState$.pipe(catchErr)) ||
        of({})).pipe(share());
    const middleware$ = (config &&
        config.middleware$ &&
        config.middleware$.pipe(catchErr)) ||
        of([]);
    const destroy$ = (config && config.destroy$ && config.destroy$.pipe(catchErr)) || NEVER;
    const actionFlatten = fop[(options && options.actionFlatOp) || FlattenOperator.concatMap];
    const stateFlatten = fop[(options && options.stateFlatOp) || FlattenOperator.switchMap];
    const flattenState$ = (source) => source.pipe(stateFlatten(flatCatch), map(mapToObservable), stateFlatten(flatCatch));
    const bufferSize = (options && options.bufferSize) || 1;
    const windowTime = options && options.windowTime;
    const shareReplayConfig = {
        refCount: false,
        bufferSize,
        windowTime
    };
    return {
        reducer$,
        actions$,
        actionStream$,
        initialState$,
        middleware$,
        destroy$,
        flattenState$,
        shareReplayConfig
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
class Store {
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
    constructor(config, options) {
        this.config = config;
        this.options = options;
        const { reducer$, actions$, actionStream$, middleware$, initialState$, destroy$, flattenState$, shareReplayConfig } = getDefaults(this.config, this.options);
        this.state$ = combineLatest(initialState$, reducer$, middleware$).pipe(map(reducerFactory$), concatMap(actionStream$), startWith(initialState$), flattenState$, takeUntil(destroy$), shareReplay(shareReplayConfig));
        this.state$.subscribe();
        this.actions$ = actions$.pipe(shareReplay(shareReplayConfig));
    }
}
function createStore(config = {}, opts = {}) {
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
const mapPS = (mapFn) => (reducer) => (state, action) => reducer(mapFn(state), action);
const mapNS = (mapFn) => (reducer) => (state, action) => mapFn(reducer(state, action));
/**
 *
 * @param mapFn - a function to map an action with
 * @returns {MiddlewareFn} MiddlewareFn<State, ActionsUnion>
 */
const mapA = (mapFn) => (reducer) => (state, action) => reducer(state, mapFn(action));
/**
 *
 * @param filterFn - a function to filter a state with
 * @returns {MiddlewareFn} MiddlewareFn<State>
 *
 * PS - previous state
 * NS - next state
 */
const filterPS = (filterFn) => (reducer) => (state, action) => {
    return filterFn(state) ? reducer(state, action) : state;
};
const filterNS = (filterFn) => (reducer) => (state, action) => {
    const nextState = reducer(state, action);
    return filterFn(nextState) ? nextState : state;
};
/**
 *
 * @param filterFn - a function to filter an action with
 * @returns {MiddlewareFn} MiddlewareFn<State, ActionsUnion>
 */
const filterA = (filterFn) => (reducer) => (state, action) => {
    return filterFn(action) ? reducer(state, action) : state;
};
/**
 * Reduce into state
 * @param reduceFn - a function to reduce the state and action together
 * @returns {MiddlewareFn} MiddlewareFn<State, ActionsUnion>
 *
 * PS - previous state
 * NS - next state
 */
const reducePS = (reducerFn) => (reducer) => (state, action) => {
    return reducer(reducerFn(state, action), action);
};
const reduceNS = (reducerFn) => (reducer) => (state, action) => {
    return reducerFn(reducer(state, action), action);
};
/**
 *
 * Reduce into action
 * @param reduceFn - a function to reduce the state and action together
 * @returns {MiddlewareFn} MiddlewareFn<State, ActionsUnion>
 */
const reduceA = (reducerFn) => (reducer) => (state, action) => {
    return reducer(state, reducerFn(state, action));
};

export { FlattenOperator, Store, catchErr, createStore, filterA, filterNS, filterPS, mapA, mapNS, mapPS, mapToObservable, reduceA, reduceNS, reducePS };
