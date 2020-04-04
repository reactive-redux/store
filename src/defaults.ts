import { Observable, of, EMPTY, NEVER, OperatorFunction, Subject } from 'rxjs';

import {
  FlattenOperator,
  StoreConfig,
  StoreOptions,
  Middleware,
  IAction,
  ReducerFn
} from './interfaces';
import { catchErr, flatCatch, mapToObservable, isObject } from './utils';
import {
  switchMap,
  mergeMap,
  concatMap,
  exhaustMap,
  map,
  share,
  filter,
  tap
} from 'rxjs/operators';
import { ShareReplayConfig } from 'rxjs/internal/operators/shareReplay';

const fop: { [key in FlattenOperator]: any } = {
  switchMap,
  mergeMap,
  concatMap,
  exhaustMap
};

export function getDefaults<State, ActionsUnion extends IAction>(
  config: StoreConfig<State, ActionsUnion> = {},
  options: StoreOptions = {}
) {
  const reducer$ =
    (config && config.reducer$ && config.reducer$.pipe<ReducerFn<State, ActionsUnion>>(catchErr)) ||
    of<ReducerFn<State, ActionsUnion>>((state, action) => state);

  const actions$ = new Subject<ActionsUnion>();

  const actionStream$: (
    reducer: OperatorFunction<any, State>
  ) => Observable<any> = reducer$ =>
    (
      (config && config.actionStream$ && config.actionStream$.pipe(catchErr)) ||
      EMPTY
    ).pipe(
      filter(isObject),
      map(mapToObservable),
      actionFlatten(flatCatch),
      tap(actions$),
      reducer$,
      map(mapToObservable)
    );

  const initialState$: Observable<State> = (
    (config && config.initialState$ && config.initialState$.pipe(catchErr)) ||
    of({})
  ).pipe(share());

  const middleware$: Observable<Middleware<State, ActionsUnion>> =
    (config &&
      config.middleware$ &&
      config.middleware$.pipe<Middleware<State, ActionsUnion>>(catchErr)) ||
    of<Middleware<State, ActionsUnion>>([]);

  const destroy$: Observable<boolean> =
    (config && config.destroy$ && config.destroy$.pipe(catchErr)) || NEVER;

  const actionFlatten: any =
    fop[(options && options.actionFlatOp) || FlattenOperator.concatMap];

  const stateFlatten =
    fop[(options && options.stateFlatOp) || FlattenOperator.switchMap];

  const flattenState$ = <T>(source: Observable<T>) =>
    source.pipe<any, any, T>(
      stateFlatten(flatCatch),
      map(mapToObservable),
      stateFlatten(flatCatch)
    );

  const bufferSize = (options && options.bufferSize) || 1;
  const windowTime = options && options.windowTime;

  const shareReplayConfig: ShareReplayConfig = {
    refCount: false,
    bufferSize,
    windowTime
  };

  return {
    reducer$,
    actions$,
    actionStream$,
    initialState$,
    middleware$,
    destroy$,
    flattenState$,
    shareReplayConfig
  };
}
