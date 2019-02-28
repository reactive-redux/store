import { Observable, combineLatest } from 'rxjs';
import {
  scan,
  startWith,
  shareReplay,
  takeUntil,
  switchMap,
  map,
  filter
} from 'rxjs/operators';
import { reducerFactory } from './reducer.factory';
import { StoreConfig, StoreOptions } from './interfaces';
import { mapToObservable, flattenObservable, isObject } from './utils';
import { getDefaults } from './defaults';

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
   *    actions$ = EMPTY (if not defined, no actions will be dispatched in the store)
   *    initialState$ = of({})
   *    metaReducers$ = of({})
   *    destroy$ = NEVER (if not defined, the state subscription is never destroyed)
   *
   * Options defaults:
   *    actions = concatMap (actions are executed in order of propagation)
   *    state = switchMap (will update to the latest received state, without waiting for previous async operations to finish)
   */
  constructor(
    private config?: StoreConfig<State, ActionsUnion>,
    private options?: StoreOptions
  ) {
    const {
      actionMap$,
      actions$,
      destroy$,
      initialState$,
      metaReducers$,
      actionFop,
      stateFop
    } = getDefaults<State, ActionsUnion>(this.config, this.options);

    this.state$ = combineLatest(actionMap$, metaReducers$, initialState$).pipe(
      map(([map, meta, state]) => scan(reducerFactory(map, meta), state)),
      switchMap(scanReducer =>
        actions$.pipe(
          filter(isObject),
          mapToObservable(),
          actionFop(flattenObservable),
          scanReducer,
          mapToObservable()
        )
      ),
      startWith(initialState$),
      stateFop(flattenObservable),
      takeUntil<State>(destroy$),
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
