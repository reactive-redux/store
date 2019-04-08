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
  TransducerMap,
  IAction,
  Schedulers
} from './interfaces';
import { catchErr, flattenObservable, createActions } from './utils';
import {
  switchMap,
  mergeMap,
  concatMap,
  exhaustMap,
  map,
  share,
  filter
} from 'rxjs/operators';
import { AnimationFrameScheduler } from 'rxjs/internal/scheduler/AnimationFrameScheduler';
import { ShareReplayConfig } from 'rxjs/internal/operators/shareReplay';
import { actionFactory } from './action.factory';

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

  const transducers$ =
    (config &&
      config.transducers$ &&
      config.transducers$.pipe<TransducerMap<State, ActionsUnion>>(catchErr)) ||
    of({});

  const destroy$: Observable<boolean> =
    (config && config.destroy$ && config.destroy$.pipe(catchErr)) || NEVER;

  const actionFop: any =
    fop[(options && options.actionFop) || FlattenOperator.concatMap];

  const actionFactory$ = actionFactory<State, ActionsUnion>(actionStream$, actionFop);

  const stateFop = fop[(options && options.stateFop) || FlattenOperator.switchMap];

  const flattenState$ = (fo = flattenObservable) => (source: any) =>
    source.pipe(stateFop(flattenObservable as any) as any);

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
    refCount: true,
    bufferSize,
    scheduler,
    windowTime
  };

  return {
    actionMap$,
    currentActions$,
    initialState$,
    transducers$,
    destroy$,
    actionFactory$,
    flattenState$,
    shareReplayConfig
  };
}
