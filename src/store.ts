import { Observable, combineLatest } from 'rxjs';
import { startWith, shareReplay, takeUntil, concatMap, map } from 'rxjs/operators';
import { reducerFactory$ } from './reducer.factory';
import { StoreConfig, StoreOptions, IAction } from './interfaces';
import { getDefaults } from './defaults';

/**
 * Reactive state container based on RxJS (https://rxjs.dev/)
 *
 * @class AsyncStore<State, ActionsUnion>
 *
 * @type State - application state interface
 * @type ActionsUnion - type union of all the actions
 */
export class Store<State, ActionsUnion extends IAction = any> {
  public state$: Observable<State>;
  public actions$: Observable<{
    [key: string]: (payload?: unknown) => ActionsUnion;
  }>;

  /**
   * Default configuration
   *
   * @param {Object} config
   *  {
   *     actionMap$: of({}),
   *     actions$: EMPTY, // if not defined, no actions will be dispatched in the store
   *     initialState$: of({}),
   *     metaReducers$: of({}),
   *     destroy$: NEVER // if not defined, the state subscription will live forever
   *  }
   *
   * @param {Object} options
   *  {
   *     actionFop: FlattenOps.concatMap, // actions are executed in order of propagation
   *     stateFop: FlattenOps.switchMap // will update to the latest received state, without waiting for previous async operations to finish
   *     scheduler: undefined,
   *     windowTime: undefined
   *  }
   */
  constructor(
    private config?: StoreConfig<State, ActionsUnion>,
    private options?: StoreOptions
  ) {
    const {
      actionMap$,
      currentActions$,
      transducers$,
      actionFactory$,
      initialState$,
      flattenState$,
      destroy$,
      shareReplayConfig
    } = getDefaults<State, ActionsUnion>(this.config, this.options);

    this.state$ = combineLatest(actionMap$, transducers$, initialState$).pipe(
      map(reducerFactory$),
      concatMap(actionFactory$),
      startWith(initialState$),
      flattenState$(),
      takeUntil<State>(destroy$),
      shareReplay(shareReplayConfig)
    );

    this.state$.subscribe();

    this.actions$ = currentActions$;
  }
}

export function createStore<State, ActionsUnion extends IAction>(
  config: StoreConfig<State, ActionsUnion> = {},
  opts: StoreOptions = {}
) {
  return new Store<State, ActionsUnion>(config, opts);
}
