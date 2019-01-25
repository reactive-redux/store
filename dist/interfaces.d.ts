import { Observable } from 'rxjs';
import { ActionMonad } from './action.monad';
export declare type AsyncType<T> = T | Promise<T> | Observable<T>;
export interface Action {
    type: string;
    payload?: unknown;
}
export declare type ReducerFn<State, ActionsUnion> = (state: State, action: ActionsUnion) => AsyncType<State>;
export declare type ActionMap<State, A extends ActionMonad<State>> = {
    [key: string]: A;
};
export declare type MetaReducerFn<State, ActionsUnion> = (reducer: ReducerFn<State, ActionsUnion>) => ReducerFn<State, ActionsUnion>;
export declare type MetaReducerMap<T, U> = {
    [key: string]: MetaReducerFn<T, U>;
};
export declare enum FlattenOps {
    switchMap = "switchMap",
    mergeMap = "mergeMap",
    concatMap = "concatMap",
    exhaustMap = "exhaustMap"
}
