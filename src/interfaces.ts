import { Observable } from 'rxjs';
import { Reducer, Action } from 'ts-action';

export enum FlattenOperator {
  switchMap = 'switchMap',
  mergeMap = 'mergeMap',
  concatMap = 'concatMap',
  exhaustMap = 'exhaustMap'
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

export type AsyncType<T> = T | Promise<T> | Observable<T>;

export type IAction = { type: string, payload: any };

export type ReducerFn<State, A extends Action> = (state: State, action: A) => State;

export type MiddlewareFn<State, A extends Action> = (
  reducer: ReducerFn<State, A>
) => ReducerFn<State, A>;

export type Middleware<T, A extends Action> = MiddlewareFn<T, A>[];
