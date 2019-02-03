import { Observable, combineLatest, Subject, of } from 'rxjs';
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
  ActionMap
} from './interfaces';
import { mapToObservable, catchErr } from './utils';

/**
 * State container based on RxJS observables
 *
 *
 *
 * @class AsyncStore<State, ActionsUnion>
 */

export class AsyncStore<State, ActionsUnion = any> {
  public state$: Observable<State>;

  private flattenOp: { [key in FlattenOps]: any } = {
    switchMap,
    mergeMap,
    concatMap,
    exhaustMap
  };

  /**
   * Config defaults:
   *    actionMap$ = of({})
   *    actions$ = new Subject() (if not defined, no actions will be dispatched in the store)
   *    initialState$ = of({})
   *    metaReducers$ = of({})
   *    destroy$ = new Subject() (if not defined, the state subscription is never destroyed)
   *
   * Options defaults:
   *    actions = concatMap
   *    state = switchMap
   */
  constructor(
    private config?: {
      actionMap$?: Observable<ActionMap<State>>;
      actions$?: Observable<AsyncType<ActionsUnion>>;
      initialState$?: Observable<AsyncType<State>>;
      metaReducers$?: Observable<MetaReducerMap<State>>;
      onDestroy$?: Observable<boolean>;
    },
    private options?: {
      actionFop?: FlattenOps;
      stateFop?: FlattenOps;
    }
  ) {
    const _actionMap$: Observable<ActionMap<State>> =
      (this.config &&
        this.config.actionMap$ &&
        this.config.actionMap$.pipe(catchErr)) ||
      of({});

    const _actions$ =
      (this.config &&
        this.config.actions$ &&
        this.config.actions$.pipe(catchErr)) ||
      new Subject().asObservable();

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
      new Subject<boolean>().asObservable();

    const actionFop = this.flattenOp[
      (this.options && this.options.actionFop) || FlattenOps.concatMap
    ];

    const stateFop = this.flattenOp[
      (this.options && this.options.stateFop) || FlattenOps.switchMap
    ];

    this.state$ = combineLatest(
      _actionMap$,
      _metaReducers$,
      _initialState$
    ).pipe(
      map(([a, m, i]) => scan(reducerFactory(a, m), i)),
      switchMap(reducer =>
        _actions$.pipe(
          filter(a => !!a),
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
