import { Observable } from 'rxjs';
export declare enum FlattenOperators {
    switchMap = "switchMap",
    mergeMap = "mergeMap",
    concatMap = "concatMap",
    exhaustMap = "exhaustMap"
}
export interface StoreConfig<State, ActionsUnion> {
    actionMap$?: Observable<ActionMap<State>>;
    actions$?: Observable<ActionsUnion>;
    initialState$?: Observable<State>;
    transducers$?: Observable<TransducerMap<State>>;
    destroy$?: Observable<any>;
}
export interface StoreOptions {
    actionFop?: FlattenOperators;
    stateFop?: FlattenOperators;
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
export declare type TransducerFn<State> = (reducer: ReducerFn<State>) => ReducerFn<State>;
export declare type TransducerMap<T> = {
    [key: string]: TransducerFn<T>;
};
