import { Observable } from 'rxjs';
import { Reducer, Action } from 'ts-action';
export declare enum FlattenOperator {
    switchMap = "switchMap",
    mergeMap = "mergeMap",
    concatMap = "concatMap",
    exhaustMap = "exhaustMap"
}
export interface StoreConfig<State> {
    reducer$?: Observable<Reducer<State>>;
    actionStream$?: Observable<any>;
    initialState$?: Observable<State>;
    middleware$?: Observable<any[]>;
    destroy$?: Observable<boolean>;
}
export interface StoreOptions {
    actionFlatOp?: FlattenOperator;
    stateFlatOp?: FlattenOperator;
    bufferSize?: number;
    windowTime?: number;
}
export declare type AsyncType<T> = T | Promise<T> | Observable<T>;
export declare type IAction = {
    type: string;
    payload: any;
};
export declare type ReducerFn<State, A extends Action> = (state: State, action: A) => State;
export declare type MiddlewareFn<State, A extends Action> = (reducer: ReducerFn<State, A>) => ReducerFn<State, A>;
export declare type middleware<T, A extends Action> = MiddlewareFn<T, A>[];
