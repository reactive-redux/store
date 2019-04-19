import { Observable, of, EMPTY, NEVER } from 'rxjs';

import {
  ActionMap,
  AsyncType,
  FlattenOperator,
  StoreConfig,
  StoreOptions,
  Transducers,
  IAction
} from './interfaces';
import {
  catchErr,
  flattenObservable,
  createActions,
  mapToObservable,
  isObject
} from './utils';
import {
  switchMap,
  mergeMap,
  concatMap,
  exhaustMap,
  map,
  share,
  filter
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
  const createdActions =
    (config &&
      config.reducers$ &&
      config.reducers$.pipe(
        filter(r => isObject(r) || Array.isArray(r)),
        map(r => (Array.isArray(r) ? createActions<State, ActionsUnion>(r) : r)),
        catchErr,
        share()
      )) ||
    of({});

  const actionMap$: Observable<ActionMap<State, ActionsUnion>> = createdActions.pipe(
    filter(a => a.actionMap$),
    map(a => a.actionMap$)
  );

  const actionFactory$: Observable<{
    [key: string]: (payload?: unknown) => any;
  }> = createdActions.pipe(
    filter(a => a.actions),
    map(a => a.actions)
  );

  const actionStream$: Observable<AsyncType<ActionsUnion>> =
    (config && config.actionStream$ && config.actionStream$.pipe(catchErr)) || EMPTY;

  const initialState$: Observable<State> =
    (config && config.initialState$ && config.initialState$.pipe(catchErr)) ||
    of({});

  const transducers$: Observable<Transducers<State, ActionsUnion>> =
    (config &&
      config.transducers$ &&
      config.transducers$.pipe<Transducers<State, ActionsUnion>>(catchErr)) ||
    of([]);

  const destroy$: Observable<boolean> =
    (config && config.destroy$ && config.destroy$.pipe(catchErr)) || NEVER;

  const actionFlatten: any =
    fop[(options && options.actionFop) || FlattenOperator.concatMap];

  const stateFlatten =
    fop[(options && options.stateFop) || FlattenOperator.switchMap];

  const flattenState$ = (source: any) =>
    source.pipe(
      stateFlatten(flattenObservable),
      map(mapToObservable),
      stateFlatten(flattenObservable)
    );

  const bufferSize = (options && options.bufferSize) || 1;
  const windowTime = options && options.windowTime;

  const shareReplayConfig: ShareReplayConfig = {
    refCount: false,
    bufferSize,
    windowTime
  };

  return {
    actionMap$,
    actionStream$,
    actionFactory$,
    initialState$,
    transducers$,
    destroy$,
    actionFlatten,
    flattenState$,
    shareReplayConfig
  };
}
