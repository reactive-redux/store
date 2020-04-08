import { Observable } from 'rxjs';

export enum FlattenOperator {
  switchMap = 'switchMap',
  mergeMap = 'mergeMap',
  concatMap = 'concatMap',
  exhaustMap = 'exhaustMap'
}

export interface StoreConfig<State, ActionUnion> {
  reducer$?: Observable<ReducerFn<State, ActionUnion>>;
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

export type ReducerFn<State, A> = (state: State, action: A) => State;

export type MiddlewareFn<State, A> = (
  reducer: ReducerFn<State, A>
) => ReducerFn<State, A>;

export type Middleware<T, A> = MiddlewareFn<T, A>[];
