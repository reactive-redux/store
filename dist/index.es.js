import { pipe, of, isObservable, from, Subject, EMPTY, NEVER, combineLatest } from 'rxjs';
import { catchError, scan, filter, map, tap, share, switchMap, mergeMap, concatMap, exhaustMap, startWith, takeUntil, shareReplay } from 'rxjs/operators';

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
        of((state, action) => state);
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
const mapPS = (mapFn) => (reducer) => (state, IAction) => reducer(mapFn(state), IAction);
const mapNS = (mapFn) => (reducer) => (state, IAction) => mapFn(reducer(state, IAction));
/**
 *
 * @param mapFn - a function to map an IAction with
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
const mapA = (mapFn) => (reducer) => (state, IAction) => reducer(state, mapFn(IAction));
/**
 *
 * @param filterFn - a function to filter a state with
 * @returns {MiddlewareFn} MiddlewareFn<State>
 *
 * PS - previous state
 * NS - next state
 */
const filterPS = (filterFn) => (reducer) => (state, IAction) => {
    return filterFn(state) ? reducer(state, IAction) : state;
};
const filterNS = (filterFn) => (reducer) => (state, IAction) => {
    const nextState = reducer(state, IAction);
    return filterFn(nextState) ? nextState : state;
};
/**
 *
 * @param filterFn - a function to filter an IAction with
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
const filterA = (filterFn) => (reducer) => (state, IAction) => {
    return filterFn(IAction) ? reducer(state, IAction) : state;
};
/**
 * Reduce into state
 * @param reduceFn - a function to reduce the state and IAction together
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 *
 * PS - previous state
 * NS - next state
 */
const reducePS = (reducerFn) => (reducer) => (state, IAction) => {
    return reducer(reducerFn(state, IAction), IAction);
};
const reduceNS = (reducerFn) => (reducer) => (state, IAction) => {
    return reducerFn(reducer(state, IAction), IAction);
};
/**
 *
 * Reduce into IAction
 * @param reduceFn - a function to reduce the state and IAction together
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
const reduceA = (reducerFn) => (reducer) => (state, IAction) => {
    return reducer(state, reducerFn(state, IAction));
};

export { FlattenOperator, Store, catchErr, createStore, filterA, filterNS, filterPS, mapA, mapNS, mapPS, mapToObservable, reduceA, reduceNS, reducePS };
