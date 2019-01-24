import { Observable } from 'rxjs';

export interface Action {
  type: string;
  payload?: any;
}

export type ReducerFn<State, ActionsUnion> = (
  state: State,
  action: ActionsUnion
) => State | Promise<State> | Observable<State>;

export type ActionMap<State, ActionsUnion extends Action> = {
  // [key in ActionsUnion['type']]: ReducerFn<State, ActionsUnion>,
  [key: string]: any;
};

export type MetaReducerFn<State, ActionsUnion> = (
  reducer: ReducerFn<State, ActionsUnion>
) => (
  state: State | Promise<State> | Observable<State>,
  action: ActionsUnion
) => State | Promise<State> | Observable<State>;

export type MetaReducerMap<T, U> = {
  [key: string]: MetaReducerFn<T, U>;
};

export enum FlattenOps {
  switchMap = 'switchMap',
  mergeMap = 'mergeMap',
  concatMap = 'concatMap',
  exhaustMap = 'exhaustMap'
}
