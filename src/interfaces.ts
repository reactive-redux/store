import { Observable } from 'rxjs';

export type IAction<T = any> = { type: string, payload?: T };

export enum FlattenOperator {
  switchMap = 'switchMap',
  mergeMap = 'mergeMap',
  concatMap = 'concatMap',
  exhaustMap = 'exhaustMap'
}

export interface StoreConfig<State, ActionUnion extends IAction> {
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

export type ReducerFn<State, A extends IAction> = (state: State, action: A) => State;

export type MiddlewareFn<State, A extends IAction> = (
  reducer: ReducerFn<State, A>
) => ReducerFn<State, A>;

export type Middleware<T, A extends IAction> = MiddlewareFn<T, A>[];
