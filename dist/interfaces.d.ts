import { Observable } from 'rxjs';
export interface IAction {
    type: string;
    payload?: unknown;
}
export declare enum FlattenOperator {
    switchMap = "switchMap",
    mergeMap = "mergeMap",
    concatMap = "concatMap",
    exhaustMap = "exhaustMap"
}
export declare enum Scheduler {
    queue = "queueScheduler",
    asap = "asapScheduler",
    animationFrame = "animationFrameScheduler",
    async = "asyncScheduler"
}
export interface StoreConfig<State, ActionsUnion extends IAction> {
    actionMap$?: Observable<ActionMap<State, ActionsUnion>>;
    actions$?: Observable<ActionsUnion | AsyncType<ActionsUnion>>;
    initialState$?: Observable<State>;
    transducers$?: Observable<TransducerMap<State, ActionsUnion>>;
    destroy$?: Observable<any>;
}
export interface StoreOptions {
    actionFop?: FlattenOperator;
    stateFop?: FlattenOperator;
    scheduler?: Scheduler;
    bufferSize?: number;
    windowTime?: number;
}
export declare type AsyncType<T> = T | Promise<T> | Observable<T>;
export declare type ReducerFn<State, A extends IAction> = (state: State, action: A) => State;
export declare type ActionMap<State, A extends IAction> = {
    [key: string]: ReducerFn<State, A>;
};
export declare type TransducerFn<State, A extends IAction> = (reducer: ReducerFn<State, A>) => ReducerFn<State, A>;
export declare type TransducerMap<T, A extends IAction> = {
    [key: string]: TransducerFn<T, A>;
};
