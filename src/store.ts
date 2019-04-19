import { Observable, combineLatest, Subject } from 'rxjs';
import {
  startWith,
  shareReplay,
  takeUntil,
  concatMap,
  map,
  filter,
  tap
} from 'rxjs/operators';
import { reducerFactory$ } from './reducer.factory';
import { StoreConfig, StoreOptions, IAction } from './interfaces';
import { getDefaults } from './defaults';
import { mapToObservable, isObject, flattenObservable } from './utils';

/**
 * Reactive state container based on RxJS (https://rxjs.dev/)
 *
 * @class AsyncStore<State, ActionsUnion>
 *
 * @type State - application state interface
 * @type ActionsUnion - type union of all the actions
 */
export class Store<State, ActionsUnion extends IAction = any> {
  private _actions$ = new Subject<ActionsUnion>();

  public state$: Observable<State>;
  public actions$: Observable<ActionsUnion>;
  public actionFactory$: Observable<{
    [key: string]: <R, T>(payload?: T) => R;
  }>;

  /**
   * Default configuration
   *
   * @param {Object} config
   *  {
   *     reducers$: of([]),
   *     actionStream$: EMPTY, // if not defined, no actions will be dispatched in the store
   *     initialState$: of({}),
   *     transducers$: of({}),
   *     destroy$: NEVER // if not defined, the state subscription will live forever
   *  }
   *
   * @param {Object} options
   *  {
   *     actionFop: FlattenOps.concatMap, // actions are executed in order of propagation
   *     stateFop: FlattenOps.switchMap // will update to the latest received state, without waiting for previous async operations to finish
   *     windowTime: undefined
   *     bufferSize: 1
   *  }
   */
  constructor(
    private config?: StoreConfig<State, ActionsUnion>,
    private options?: StoreOptions
  ) {
    const {
      actionMap$,
      actionStream$,
      actionFactory$,
      transducers$,
      actionFlatten,
      initialState$,
      flattenState$,
      destroy$,
      shareReplayConfig
    } = getDefaults<State, ActionsUnion>(this.config, this.options);

    this.state$ = combineLatest(actionMap$, transducers$, initialState$).pipe(
      map(reducerFactory$),
      concatMap(reducer$ =>
        actionStream$.pipe(
          filter(isObject),
          map(mapToObservable),
          actionFlatten(flattenObservable),
          tap<ActionsUnion>(this._actions$),
          reducer$,
          map(mapToObservable)
        )
      ),
      startWith(initialState$),
      flattenState$,
      takeUntil<State>(destroy$),
      shareReplay(shareReplayConfig)
    );

    this.state$.subscribe();

    this.actionFactory$ = actionFactory$;

    this.actions$ = this._actions$.asObservable();
  }
}

export function createStore<State, ActionsUnion extends IAction>(
  config: StoreConfig<State, ActionsUnion> = {},
  opts: StoreOptions = {}
) {
  return new Store<State, ActionsUnion>(config, opts);
}
