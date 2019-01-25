import { Observable } from 'rxjs';
import { ActionMonad } from './action.monad';

export type AsyncType<T> = T | Promise<T> | Observable<T>;

export interface Action {
  type: string;
  payload?: unknown;
}

export type ReducerFn<State, ActionsUnion> = (
  state: State,
  action: ActionsUnion
) => AsyncType<State>;

export type ActionMap<State, A extends ActionMonad<State>> = {
  // [key in ActionsUnion['type']]: ReducerFn<State, ActionsUnion>,
  [key: string]: A;
};

export type MetaReducerFn<State, ActionsUnion> = (
  reducer: ReducerFn<State, ActionsUnion>
) => ReducerFn<State, ActionsUnion>;

export type MetaReducerMap<T, U> = {
  [key: string]: MetaReducerFn<T, U>;
};

export enum FlattenOps {
  switchMap = 'switchMap',
  mergeMap = 'mergeMap',
  concatMap = 'concatMap',
  exhaustMap = 'exhaustMap'
}
