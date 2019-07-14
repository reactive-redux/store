import { Observable } from 'rxjs';
import { Reducer, Action } from 'ts-action';

export enum FlattenOperator {
  switchMap = 'switchMap',
  mergeMap = 'mergeMap',
  concatMap = 'concatMap',
  exhaustMap = 'exhaustMap'
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

export type AsyncType<T> = T | Promise<T> | Observable<T>;

export type IAction = { type: string, payload: any };

export type ReducerFn<State, A extends Action> = (state: State, action: A) => State;

export type TransducerFn<State, A extends Action> = (
  reducer: ReducerFn<State, A>
) => ReducerFn<State, A>;

export type Transducers<T, A extends Action> = TransducerFn<T, A>[];
