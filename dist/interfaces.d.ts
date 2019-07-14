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
    transducers$?: Observable<any[]>;
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
export declare type TransducerFn<State, A extends Action> = (reducer: ReducerFn<State, A>) => ReducerFn<State, A>;
export declare type Transducers<T, A extends Action> = TransducerFn<T, A>[];
