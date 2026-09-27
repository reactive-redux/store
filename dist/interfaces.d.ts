import { Observable } from 'rxjs';
import { DevToolsConfig } from './devtools';
export declare enum FlattenOperator {
    switchMap = "switchMap",
    mergeMap = "mergeMap",
    concatMap = "concatMap",
    exhaustMap = "exhaustMap"
}
export interface StoreConfig<State, ActionUnion> {
    reducer$?: Observable<ReducerFn<State, ActionUnion>>;
    actionStream$?: Observable<ActionUnion>;
    initialState$?: Observable<State>;
    middleware$?: Observable<Middleware<State, ActionUnion>>;
    destroy$?: Observable<any>;
    epic$?: (action$: Observable<ActionUnion>, state$: Observable<State>) => Observable<ActionUnion>;
    /**
     * Connect this store to the Redux DevTools browser extension.
     * `true` enables it with defaults; an options object customizes it;
     * `false`/`undefined` (or `enabled: false`) keeps it off. Wraps the
     * reducer for time-travel support and streams every (action, state)
     * pair to the extension. Inert when the extension is not installed.
     * Disconnects automatically on `destroy$`.
     */
    devTools?: DevToolsConfig;
}
export interface StoreOptions {
    actionFlatOp?: FlattenOperator;
    stateFlatOp?: FlattenOperator;
    bufferSize?: number;
    windowTime?: number;
}
export type AsyncType<T> = T | Promise<T> | Observable<T>;
export type ReducerFn<State, A> = (state: State, action: A) => State;
export type MiddlewareFn<State, A> = (reducer: ReducerFn<State, A>) => ReducerFn<State, A>;
export type Middleware<T, A> = MiddlewareFn<T, A>[];
