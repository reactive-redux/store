import { Observable } from 'rxjs';
import { Reducer, Action } from 'ts-action';
export declare enum FlattenOperator {
    switchMap = "switchMap",
    mergeMap = "mergeMap",
    concatMap = "concatMap",
    exhaustMap = "exhaustMap"
}
export interface StoreConfig<State, ActionUnion extends Action> {
    reducer$?: Observable<Reducer<State>>;
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
export declare type IAction = {
    type: string;
    payload: any;
};
export declare type ReducerFn<State, A extends Action> = (state: State, action: A) => State;
export declare type MiddlewareFn<State, A extends Action> = (reducer: ReducerFn<State, A>) => ReducerFn<State, A>;
export declare type Middleware<T, A extends Action> = MiddlewareFn<T, A>[];
