import { Observable } from 'rxjs';
export interface IAction {
    type: string;
    payload?: unknown;
}
export declare type ACReturnType<T, A extends IAction> = {
    actions: {
        [key: string]: (payload?: unknown) => any;
    };
    actionMap$: {
        [key: string]: ReducerFn<T, A>;
    };
};
export declare type ActionCreator = <T, A extends IAction>(a: ReducerFn<T, A>[]) => ACReturnType<T, A>;
export declare enum FlattenOperator {
    switchMap = "switchMap",
    mergeMap = "mergeMap",
    concatMap = "concatMap",
    exhaustMap = "exhaustMap"
}
export declare type ConfigActionMap<State, ActionsUnion extends IAction> = Observable<ReducerFn<State, ActionsUnion>[] | ACReturnType<State, ActionsUnion>>;
export interface StoreConfig<State, ActionsUnion extends IAction> {
    reducers$?: ConfigActionMap<State, ActionsUnion>;
    actionStream$?: Observable<ActionsUnion | AsyncType<ActionsUnion>>;
    initialState$?: Observable<State>;
    transducers$?: Observable<Transducers<State, ActionsUnion>>;
    destroy$?: Observable<any>;
}
export interface StoreOptions {
    actionFop?: FlattenOperator;
    stateFop?: FlattenOperator;
    bufferSize?: number;
    windowTime?: number;
}
export declare type AsyncType<T> = T | Promise<T> | Observable<T>;
export declare type ReducerFn<State, A extends IAction> = (state: State, action: A) => State;
export declare type ActionMap<State, A extends IAction> = {
    [key: string]: ReducerFn<State, A>;
};
export declare type TransducerFn<State, A extends IAction> = (reducer: ReducerFn<State, A>) => ReducerFn<State, A>;
export declare type Transducers<T, A extends IAction> = TransducerFn<T, A>[];
