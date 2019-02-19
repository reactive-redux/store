import { Observable, combineLatest, of, never } from 'rxjs';
import {
  scan,
  startWith,
  shareReplay,
  takeUntil,
  switchMap,
  map,
  concatMap,
  mergeMap,
  exhaustMap,
  filter
} from 'rxjs/operators';

import { reducerFactory } from './reducer.factory';
import {
  MetaReducerMap,
  FlattenOps,
  AsyncType,
  ActionMap,
  StoreConfig,
  StoreOptions
} from './interfaces';
import { mapToObservable, catchErr } from './utils';

const FlattenOperators: { [key in FlattenOps]: any } = {
  switchMap,
  mergeMap,
  concatMap,
  exhaustMap
};

/**
 * State container based on RxJS observables
 *
 *
 *
 * @class AsyncStore<State, ActionsUnion>
 */

export class Store<State, ActionsUnion = any> {
  public state$: Observable<State>;

  /**
   * Config defaults:
   *    actionMap$ = of({})
   *    actions$ = never() (if not defined, no actions will be dispatched in the store)
   *    initialState$ = of({})
   *    metaReducers$ = of({})
   *    destroy$ = never() (if not defined, the state subscription is never destroyed)
   *
   * Options defaults:
   *    actions = concatMap (actions are executed in order of propagation)
   *    state = switchMap (will update to the latest received state, without waiting for previous async operations to finish)
   */
  constructor(
    private config?: StoreConfig<State, ActionsUnion>,
    private options?: StoreOptions
  ) {
    const _actionMap$: Observable<ActionMap<State>> =
      (this.config &&
        this.config.actionMap$ &&
        this.config.actionMap$.pipe(catchErr)) ||
      of({});

    const _actions$: Observable<AsyncType<ActionsUnion>> =
      (this.config && this.config.actions$ && this.config.actions$.pipe(catchErr)) ||
      never();

    const _initialState$: Observable<State> =
      (this.config &&
        this.config.initialState$ &&
        this.config.initialState$.pipe(catchErr)) ||
      of({});

    const _metaReducers$ =
      (this.config &&
        this.config.metaReducers$ &&
        this.config.metaReducers$.pipe<MetaReducerMap<State>>(catchErr)) ||
      of({});

    const _destroy$: Observable<boolean> =
      (this.config &&
        this.config.onDestroy$ &&
        this.config.onDestroy$.pipe(catchErr)) ||
      never();

    const actionFop =
      FlattenOperators[
        (this.options && this.options.actionFop) || FlattenOps.concatMap
      ];

    const stateFop =
      FlattenOperators[
        (this.options && this.options.stateFop) || FlattenOps.switchMap
      ];

    this.state$ = combineLatest(_actionMap$, _metaReducers$, _initialState$).pipe(
      map(([map, meta, state]) => scan(reducerFactory(map, meta), state)),
      switchMap(reducer =>
        _actions$.pipe(
          filter(a => !!a && typeof a === 'object'),
          mapToObservable,
          actionFop((a: Observable<ActionsUnion>) => a.pipe(catchErr)),
          reducer,
          mapToObservable
        )
      ),
      startWith(_initialState$),
      stateFop((state: Observable<State>) => state.pipe(catchErr)),
      takeUntil<State>(_destroy$),
      shareReplay(1)
    );

    this.state$.subscribe();
  }
}

export function createStore<State, ActionsUnion = any>(
  config?: StoreConfig<State, ActionsUnion>,
  opts?: StoreOptions
) {
  return new Store<State, ActionsUnion>(config, opts);
}
