import { Observable, combineLatest, of, Subject } from 'rxjs';
import { startWith, shareReplay, takeUntil, switchMap, map } from 'rxjs/operators';
import { reducerFactory } from './reducer.factory';
import { StoreConfig, StoreOptions, IAction, Scheduler, FlattenOperator } from './interfaces';
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

  /**
   * Default configuration
   *
   * @param {Object} config
   *  {
   *     actionMap$: of({}),
   *     actions$: EMPTY, //(if not defined, no actions will be dispatched in the store)
   *     initialState$: of({}),
   *     metaReducers$: of({}),
   *     destroy$: NEVER //(if not defined, the state subscription will live forever)
   *  }
   *
   * @param {Object} options
   *  {
   *     actionFop: FlattenOps.concatMap, //(actions are executed in order of propagation)
   *     stateFop: FlattenOps.switchMap //(will update to the latest received state, without waiting for previous async operations to finish)
   *     scheduler: Scheduler.queue,
   *     windowTime: undefined
   *  }
   */
  constructor(
    private config?: StoreConfig<State, ActionsUnion>,
    private options?: StoreOptions
  ) {
    const {
      actionMap$,
      transducers$,
      actionFactory$,
      initialState$,
      flattenState$,
      destroy$,
      shareReplayConfig
    } = getDefaults<State, ActionsUnion>(this.config, this.options);

    this.state$ = combineLatest(actionMap$, transducers$, initialState$).pipe(
      map(reducerFactory),
      switchMap(actionFactory$),
      startWith(initialState$),
      flattenState$(),
      takeUntil<State>(destroy$),
      shareReplay(shareReplayConfig)
    );

    this.state$.subscribe();
  }
}

export function createStore<State, ActionsUnion extends IAction>(
  config: StoreConfig<State, ActionsUnion> = {},
  opts: StoreOptions = {}
) {
  return new Store<State, ActionsUnion>(config, opts);
}

const { state$ } = createStore();
state$.subscribe(console.log)
