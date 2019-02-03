import { Observable } from 'rxjs';
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
export declare enum FlattenOps {
    switchMap = "switchMap",
    mergeMap = "mergeMap",
    concatMap = "concatMap",
    exhaustMap = "exhaustMap"
}
