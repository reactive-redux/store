import { Observable } from 'rxjs';
export declare enum FlattenOps {
    switchMap = "switchMap",
    mergeMap = "mergeMap",
    concatMap = "concatMap",
    exhaustMap = "exhaustMap"
}
export interface StoreConfig<State, ActionsUnion> {
    actionMap$?: Observable<ActionMap<State>>;
    actions$?: Observable<AsyncType<ActionsUnion>>;
    initialState$?: Observable<State>;
    metaReducers$?: Observable<MetaReducerMap<State>>;
    onDestroy$?: Observable<boolean>;
}
export interface StoreOptions {
    actionFop?: FlattenOps;
    stateFop?: FlattenOps;
}
export declare type AsyncType<T> = T | Promise<T> | Observable<T>;
export interface IAction {
    type: string;
    payload?: unknown;
}
export declare type ReducerFn<State> = (state: State, action: any) => State;
export declare type ActionMap<State> = {
    [key: string]: ReducerFn<State>;
};
export declare type MetaReducerFn<State> = (reducer: ReducerFn<State>) => ReducerFn<State>;
export declare type MetaReducerMap<T> = {
    [key: string]: MetaReducerFn<T>;
};
