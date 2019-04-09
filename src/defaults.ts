import { Observable, of, EMPTY, NEVER } from 'rxjs';
import {
  queueScheduler,
  asapScheduler,
  animationFrameScheduler,
  asyncScheduler
} from 'rxjs';
import {
  ActionMap,
  AsyncType,
  FlattenOperator,
  StoreConfig,
  StoreOptions,
  Transducers,
  IAction,
  Schedulers
} from './interfaces';
import {
  catchErr,
  flattenObservable,
  createActions,
  mapToObservable
} from './utils';
import {
  switchMap,
  mergeMap,
  concatMap,
  exhaustMap,
  map,
  share,
  filter,
} from 'rxjs/operators';
import { AnimationFrameScheduler } from 'rxjs/internal/scheduler/AnimationFrameScheduler';
import { ShareReplayConfig } from 'rxjs/internal/operators/shareReplay';

const fop: { [key in FlattenOperator]: any } = {
  switchMap,
  mergeMap,
  concatMap,
  exhaustMap
};

const sched: { [key in Schedulers]: any } = {
  queueScheduler,
  asapScheduler,
  animationFrameScheduler,
  asyncScheduler
};

const isWindow = typeof window !== 'undefined' && !!window;

const isAnimationScheduler = (scheduler: any) =>
  scheduler instanceof AnimationFrameScheduler;

const returnDefault = () => {
  console.warn(`AnimationFrameScheduler can be used only in the browser.`);
  return undefined;
};

export function getDefaults<State, ActionsUnion extends IAction>(
  config: StoreConfig<State, ActionsUnion> = {},
  options: StoreOptions = {}
) {
  const createdActions =
    (config &&
      config.reducers$ &&
      config.reducers$.pipe(
        map(createActions),
        catchErr,
        share()
      )) ||
    of({});

  const actionMap$: Observable<ActionMap<State, ActionsUnion>> = createdActions.pipe(
    filter(a => a.actionMap$),
    map(a => a.actionMap$)
  );

  const currentActions$: Observable<{
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

  const stateFlatten = fop[(options && options.stateFop) || FlattenOperator.switchMap];

  const flattenState$ = (source: any) =>
    source.pipe(
      stateFlatten(flattenObservable),
      map(mapToObservable),
      stateFlatten(flattenObservable)
    );

  const bufferSize = (options && options.bufferSize) || 1;
  const scheduler =
    options &&
    options.scheduler &&
    !isWindow &&
    isAnimationScheduler(sched[options.scheduler])
      ? returnDefault()
      : options && options.scheduler && sched[options.scheduler];
  const windowTime = options && options.windowTime;

  const shareReplayConfig: ShareReplayConfig = {
    refCount: false,
    bufferSize,
    scheduler,
    windowTime
  };

  return {
    actionMap$,
    actionStream$,
    currentActions$,
    initialState$,
    transducers$,
    destroy$,
    actionFlatten,
    flattenState$,
    shareReplayConfig
  };
}
