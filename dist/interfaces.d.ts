import { Observable } from 'rxjs';
export interface Action {
    type: string;
    payload?: any;
}
export declare type ReducerFn<State, ActionsUnion> = (state: State, action: ActionsUnion) => State | Promise<State> | Observable<State>;
export declare type ActionMap<State, ActionsUnion extends Action> = {
    [key: string]: any;
};
export declare type MetaReducerFn<State, ActionsUnion> = (reducer: ReducerFn<State, ActionsUnion>) => (state: State | Promise<State> | Observable<State>, action: ActionsUnion) => State | Promise<State> | Observable<State>;
export declare type MetaReducerMap<T, U> = {
    [key: string]: MetaReducerFn<T, U>;
};
export declare enum FlattenOps {
    switchMap = "switchMap",
    mergeMap = "mergeMap",
    concatMap = "concatMap",
    exhaustMap = "exhaustMap"
}
