import { Observable, combineLatest } from 'rxjs';
import {
  scan,
  startWith,
  shareReplay,
  takeUntil,
  switchMap,
  map,
  filter,
  mergeMap,
  delay
} from 'rxjs/operators';
import { reducerFactory } from './reducer.factory';
import { StoreConfig, StoreOptions, ReducerFn, IAction, FlattenOperators } from './interfaces';
import {
  mapToObservable,
  flattenObservable,
  isObject,
  flattenAsyncType
} from './utils';
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
      map(([map, transducers, state]) =>
        scan(reducerFactory(map, transducers), state)
      ),
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

import { Subject, of, interval, range } from 'rxjs';
import { tap, take } from 'rxjs/operators';
import { Action } from './action';
import { AsyncType } from './interfaces';
import { select } from './selectors';

interface State {
  count: number;
}

// class Increment extends Action {
//   constructor(public payload: number) {
//     super();
//   }
// }

// class Decrement extends Action {
//   constructor(public payload: number) {
//     super();
//   }
// }

interface Increment extends IAction {
  payload: number;
}

interface Decrement extends IAction {
  payload: number;
}

type ActionsUnion = Increment | Decrement;

const actionQ = new Subject<AsyncType<ActionsUnion>>();

const initialState = {
  count: 0
};

const initialState$ = of(initialState);
const actions$ = actionQ.asObservable();

const inc = (state: State, action: Increment) =>
  flattenAsyncType(state).pipe(
    map(state => ({ count: state.count + action.payload })),
    delay(200)
  );

const decr = (state: State, action: Decrement) =>
  flattenAsyncType(state).pipe(
    map(state => ({ count: state.count - action.payload }))
  );

type ActionCreator = <T, A extends Action>(a: ReducerFn<T>[]) => { actions: { [key: string]: (payload: any) => A }, actionMap: { [key: string]: ReducerFn<T> } };
const capitalize = (str: string) =>  str.replace(/^\w/, c => c.toUpperCase());
const createActions: ActionCreator = (a) => a.reduce((acc, curr) => {
  return {
    actions: { 
      ...acc.actions,
      [capitalize(curr.name)]: (payload: any) => ({ type: curr.name, payload })
    },
    actionMap: { ...acc.actionMap, [curr.name]: curr }
  };
}, { actionMap: {}, actions: {} });

const { actionMap, actions } = createActions<State, ActionsUnion>([inc, decr]);
const { Inc, Decr } = actions;

// export const logger = reducer => (state, action) => {
//   const t1 = performance.now();
//   const newState = reducer(state, action);
//   const t2 = performance.now();
//   console.log(`${action.type} changed state to:`, newState, `in ${(t2 -t1).toFixed(2)}ms.`);
//   return newState;
// }

const actionMap$ = of(actionMap);
const transducers$ = of({
  // ['logger']: logger
});

const { state$ } = createStore<State, AsyncType<ActionsUnion>>({
  initialState$,
  actions$,
  actionMap$,
  transducers$
});

state$
  .pipe(
    select(state => state),
    tap(console.log)
  )
  .subscribe();

const add100times = ({ withInterval, times }: any) =>
  (withInterval ? interval(200) : range(0, Infinity)).pipe(
    map(i => Inc(i)),
    take(times)
  );

const finalAction: any = add100times({
  withInterval: true,
  times: 10
});

actionQ.next(finalAction);
