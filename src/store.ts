import { Observable, combineLatest, Subject, of } from 'rxjs';
import {
  startWith,
  shareReplay,
  takeUntil,
  concatMap,
  map
} from 'rxjs/operators';
import { reducerFactory$ } from './reducer.factory';
import { StoreConfig, StoreOptions, ReducerFn } from './interfaces';
import { getDefaults } from './defaults';
import {
  connectReduxDevTools,
  normalizeDevToolsConfig,
  withDevToolsTimeTravel
} from './devtools';
import { Action } from 'ts-action';

/**
 * Reactive state container based on RxJS (https://rxjs.dev/)
 *
 * @class AsyncStore<State, ActionsUnion>
 *
 * @type State - application state interface
 * @type ActionsUnion - type union of all the actions
 */
export class Store<State = {}, ActionsUnion = any> {
  private _dispatch$ = new Subject<ActionsUnion>();

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
    // Wrap the reducer before getDefaults consumes it, so DevTools
    // time-travel jumps are honored even with the default identity reducer.
    const devToolsOptions = normalizeDevToolsConfig(this.config?.devTools);
    if (devToolsOptions) {
      this.config = {
        ...this.config,
        reducer$: (
          this.config?.reducer$ ??
          of<ReducerFn<State, ActionsUnion>>(state => state)
        ).pipe(map(reducerFn => withDevToolsTimeTravel(reducerFn)))
      };
    }

    const {
      reducer$,
      actions$,
      actionStream$,
      middleware$,
      initialState$,
      destroy$,
      flattenState$,
      shareReplayConfig
    } = getDefaults<State, ActionsUnion>(this.config, this.options, this._dispatch$);

    this.state$ = combineLatest([initialState$, reducer$, middleware$]).pipe(
      map(reducerFactory$),
      concatMap(actionStream$),
      startWith(initialState$),
      flattenState$,
      takeUntil(destroy$),
      shareReplay(shareReplayConfig)
    );

    this.state$.subscribe();

    this.actions$ = actions$.pipe<ActionsUnion>(shareReplay(shareReplayConfig));

    // Wire up epic$ if provided
    if (this.config?.epic$) {
      this.config
        .epic$(this.actions$, this.state$)
        .pipe(takeUntil(destroy$))
        .subscribe({
          next: (action) => this.dispatch(action),
          error: (err) => console.error('[Epic] Error:', err),
        });
    }

    if (devToolsOptions) {
      const disconnect = connectReduxDevTools(this, devToolsOptions);
      // Mirror takeUntil(destroy$): the first emission tears the store down.
      destroy$.subscribe(() => disconnect());
    }
  }

  dispatch = (action: ActionsUnion) => {
    this._dispatch$.next(action);
  }
}

export function createStore<State = {}, ActionsUnion extends Action = any>(
  config: StoreConfig<State, ActionsUnion> = {},
  opts: StoreOptions = {}
) {
  return new Store<State, ActionsUnion>(config, opts);
}