import { Observable } from 'rxjs';
export declare type IAction = {
    type: string;
    payload?: any;
};
export declare enum FlattenOperator {
    switchMap = "switchMap",
    mergeMap = "mergeMap",
    concatMap = "concatMap",
    exhaustMap = "exhaustMap"
}
export interface StoreConfig<State, ActionUnion extends IAction> {
    reducer$?: Observable<ReducerFn<State, ActionUnion>>;
    actionStream$?: Observable<ActionUnion>;
    initialState$?: Observable<State>;
    middleware$?: Observable<Middleware<State, ActionUnion>>;
    destroy$?: Observable<any>;
}
export interface StoreOptions {
    actionFlatOp?: FlattenOperator;
    stateFlatOp?: FlattenOperator;
    bufferSize?: number;
    windowTime?: number;
}
export declare type AsyncType<T> = T | Promise<T> | Observable<T>;
export declare type ReducerFn<State, A extends IAction> = (state: State, action: A) => State;
export declare type MiddlewareFn<State, A extends IAction> = (reducer: ReducerFn<State, A>) => ReducerFn<State, A>;
export declare type Middleware<T, A extends IAction> = MiddlewareFn<T, A>[];
