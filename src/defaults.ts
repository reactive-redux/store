import { Observable, of, EMPTY, NEVER, OperatorFunction, ObservedValueOf } from 'rxjs';
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
  Scheduler
} from './interfaces';
import { catchErr, flattenObservable } from './utils';
import { switchMap, mergeMap, concatMap, exhaustMap } from 'rxjs/operators';
import { AnimationFrameScheduler } from 'rxjs/internal/scheduler/AnimationFrameScheduler';
import { ShareReplayConfig } from 'rxjs/internal/operators/shareReplay';
import { actionFactory } from './action.factory';

const fop: { [key in FlattenOperator]: any } = {
  switchMap,
  mergeMap,
  concatMap,
  exhaustMap
};

const sched: { [key in Scheduler]: any } = {
  queueScheduler,
  asapScheduler,
  animationFrameScheduler,
  asyncScheduler
};

const isWindow = typeof window !== 'undefined' && !!window;

export function getDefaults<State, ActionsUnion extends IAction>(
  config: StoreConfig<State, ActionsUnion> = {},
  options: StoreOptions = {}
) {
  const actionMap$: Observable<ActionMap<State, ActionsUnion>> =
    (config && config.actionMap$ && config.actionMap$.pipe(catchErr)) || of({});

  const actions$: Observable<AsyncType<ActionsUnion>> =
    (config && config.actions$ && config.actions$.pipe(catchErr)) || EMPTY;

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

  const actionFop: OperatorFunction<any, ObservedValueOf<any>> = fop[(options && options.actionFop) || FlattenOperator.concatMap];

  const actionFactory$ = actionFactory<State, ActionsUnion>(actions$, actionFop);

  const stateFop = fop[(options && options.stateFop) || FlattenOperator.switchMap];

  const scheduler = sched[(options && options.scheduler) || Scheduler.queue];

  const isAnimationSched = scheduler instanceof AnimationFrameScheduler;

  const flattenState$ = (fo = flattenObservable) => (source: any) => source.pipe(stateFop(flattenObservable as any) as any);

  const returnDefault = () => {
    console.warn(`
  AnimationFrameScheduler can be used only in the browser.
  Setting scheduler back to queue(default).
`);
    return sched[Scheduler.queue];
  };

  const shareReplayConfig: ShareReplayConfig = {
    refCount: true,
    bufferSize: (options && options.bufferSize) || 1,
    scheduler: !isWindow && isAnimationSched ? returnDefault() : scheduler,
    windowTime: (options && options.windowTime) || undefined
  };

  return {
    actionMap$,
    initialState$,
    transducers$,
    destroy$,
    actionFactory$,
    flattenState$,
    shareReplayConfig
  };
}
