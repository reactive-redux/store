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
 * Reactive state container based on RxJS (https://rxjs.dev/)
 *
 * @class AsyncStore<State, ActionsUnion>
 * 
 * @type State - application state interface
 * @type ActionsUnion - type union of all the actions
 */
export class Store<State, ActionsUnion = any> {
  public state$: Observable<State>;

  /**
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
   *  }
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
      transducers$,
      actionFop,
      stateFop
    } = getDefaults<State, ActionsUnion>(this.config, this.options);

    this.state$ = combineLatest(actionMap$, transducers$, initialState$).pipe(
      map(([map, transducers, state]) => scan(reducerFactory(map, transducers), state)),
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
