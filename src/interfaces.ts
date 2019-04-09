import { Observable } from 'rxjs';

export interface IAction {
  type: string;
  payload?: unknown;
}

export enum FlattenOperator {
  switchMap = 'switchMap',
  mergeMap = 'mergeMap',
  concatMap = 'concatMap',
  exhaustMap = 'exhaustMap'
}

export enum Schedulers {
  queue = 'queueScheduler',
  asap = 'asapScheduler',
  animationFrame = 'animationFrameScheduler',
  async = 'asyncScheduler'
}

export type ConfigActionMap<State, ActionsUnion extends IAction> = Observable<
  ReducerFn<State, ActionsUnion>[]
>;

export interface StoreConfig<State, ActionsUnion extends IAction> {
  reducers$?: ConfigActionMap<State, ActionsUnion>;
  actionStream$?: Observable<ActionsUnion | AsyncType<ActionsUnion>>;
  initialState$?: Observable<State>;
  transducers$?: Observable<Transducers<State, ActionsUnion>>;
  destroy$?: Observable<any>;
}

export interface StoreOptions {
  actionFop?: FlattenOperator;
  stateFop?: FlattenOperator;
  scheduler?: Schedulers;
  bufferSize?: number;
  windowTime?: number;
}

export type AsyncType<T> = T | Promise<T> | Observable<T>;

export type ReducerFn<State, A extends IAction> = (state: State, action: A) => State;

export type ActionMap<State, A extends IAction> = {
  [key: string]: ReducerFn<State, A>;
};

export type TransducerFn<State, A extends IAction> = (
  reducer: ReducerFn<State, A>
) => ReducerFn<State, A>;

export type Transducers<T, A extends IAction> = TransducerFn<T, A>[];

export type ActionCreator = <T, A extends IAction>(
  a: any[]
) => {
  actions: { [key: string]: (payload?: unknown) => any };
  actionMap$: { [key: string]: ReducerFn<T, A> };
};
