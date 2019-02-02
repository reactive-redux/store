import { Observable } from 'rxjs';

export type AsyncType<T> = T | Promise<T> | Observable<T>;

export interface Action {
  type: string;
  payload?: unknown;
}

export type ReducerFn<State> = (state: State) => State;

export type MetaReducerFn<State> = (
  reducer: ReducerFn<State>
) => ReducerFn<State>;

export type MetaReducerMap<T> = {
  [key: string]: MetaReducerFn<T>;
};

export enum FlattenOps {
  switchMap = 'switchMap',
  mergeMap = 'mergeMap',
  concatMap = 'concatMap',
  exhaustMap = 'exhaustMap'
}
