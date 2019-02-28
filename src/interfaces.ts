import { Observable } from 'rxjs';

export enum FlattenOps {
  switchMap = 'switchMap',
  mergeMap = 'mergeMap',
  concatMap = 'concatMap',
  exhaustMap = 'exhaustMap'
}

export interface StoreConfig<State, ActionsUnion> {
  actionMap$?: Observable<ActionMap<State>>;
  actions$?: Observable<AsyncType<ActionsUnion>>;
  initialState$?: Observable<State>;
  transducers$?: Observable<TransducerMap<State>>;
  destroy$?: Observable<boolean>;
}

export interface StoreOptions {
  actionFop?: FlattenOps;
  stateFop?: FlattenOps;
}

export type AsyncType<T> = T | Promise<T> | Observable<T>;

export interface IAction {
  type: string;
  payload?: unknown;
}

export type ReducerFn<State> = (state: State, action: any) => State;

export type ActionMap<State> = {
  [key: string]: ReducerFn<State>;
};

export type TransducerFn<State> = (reducer: ReducerFn<State>) => ReducerFn<State>;

export type TransducerMap<T> = {
  [key: string]: TransducerFn<T>;
};
