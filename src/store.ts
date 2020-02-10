import { Observable, combineLatest } from 'rxjs';
import {
  startWith,
  shareReplay,
  takeUntil,
  concatMap,
  map,
  tap
} from 'rxjs/operators';
import { reducerFactory$ } from './reducer.factory';
import { StoreConfig, StoreOptions } from './interfaces';
import { getDefaults } from './defaults';
import { Action } from 'ts-action';

/**
 * Reactive state container based on RxJS (https://rxjs.dev/)
 *
 * @class AsyncStore<State, ActionsUnion>
 *
 * @type State - application state interface
 * @type ActionsUnion - type union of all the actions
 */
export class Store<State, ActionsUnion extends Action<any> = any> {
  public state$: Observable<State>;
  public actions$: Observable<ActionsUnion>;

  /**
   * Default configuration
   *
   * @param {Object} config
   *  {
   *     reducer$: of(reducer({})),
   *     actionStream$: EMPTY, // if not defined, no actions will be dispatched in the store
   *     initialState$: of({}),
   *     middleware$: of([]),
   *     destroy$: NEVER // if not defined, the state subscription will live forever
   *  }
   *
   * @param {Object} options
   *  {
   *     actionFop: FlattenOps.concatMap, // Flatten operator for actions's stream.
   *     stateFop: FlattenOps.switchMap // Flatten operator for state's stream.
   *     windowTime: undefined //Maximum time length of the replay buffer in milliseconds.
   *     bufferSize: 1 //Maximum element count of the replay buffer.
   *  }
   */
  constructor(
    private config?: StoreConfig<State, ActionsUnion>,
    private options?: StoreOptions
  ) {
    const {
      reducer$,
      actions$,
      actionStream$,
      middleware$,
      initialState$,
      destroy$,
      flattenState$,
      shareReplayConfig
    } = getDefaults<State, ActionsUnion>(this.config, this.options);

    this.state$ = combineLatest(initialState$, reducer$, middleware$).pipe(
      map(reducerFactory$),
      concatMap(actionStream$),
      startWith(initialState$),
      flattenState$,
      takeUntil(destroy$),
      shareReplay(shareReplayConfig)
    );

    this.state$.subscribe();

    this.actions$ = actions$.pipe<ActionsUnion>(shareReplay(shareReplayConfig));
  }
}

export function createStore<State, ActionsUnion extends Action>(
  config: StoreConfig<State, ActionsUnion> = {},
  opts: StoreOptions = {}
) {
  return new Store<State, ActionsUnion>(config, opts);
}
