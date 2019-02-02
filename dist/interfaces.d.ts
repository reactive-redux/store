import { Observable } from 'rxjs';
export declare type AsyncType<T> = T | Promise<T> | Observable<T>;
export interface Action {
    type: string;
    payload?: unknown;
}
export declare type ReducerFn<State> = (state: State) => State;
export declare type MetaReducerFn<State> = (reducer: ReducerFn<State>) => ReducerFn<State>;
export declare type MetaReducerMap<T> = {
    [key: string]: MetaReducerFn<T>;
};
export declare enum FlattenOps {
    switchMap = "switchMap",
    mergeMap = "mergeMap",
    concatMap = "concatMap",
    exhaustMap = "exhaustMap"
}
