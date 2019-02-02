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
import { MetaReducerMap, FlattenOps, AsyncType } from './interfaces';
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

  constructor(
    private config?: {
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
    /**
     * Config defaults:
     *    actions$ = of({})
     *    initialState$ = of({})
     *    metaReducers$ = of({})
     *    destroy$ = new Subject() (never destroyed)
     *
     * Options defaults:
     *    actions = concatMap
     *    state = switchMap
     */
    const actions$ =
      (this.config &&
        this.config.actions$ &&
        this.config.actions$.pipe(catchErr)) ||
      of({});

    const initialState$ =
      (this.config &&
        this.config.initialState$ &&
        this.config.initialState$.pipe(catchErr)) ||
      of({});

    const metaReducers$ =
      (this.config &&
        this.config.metaReducers$ &&
        this.config.metaReducers$.pipe<MetaReducerMap<State>>(catchErr)) ||
      of({});

    const destroy$ =
      (this.config &&
        this.config.onDestroy$ &&
        this.config.onDestroy$.pipe(catchErr)) ||
      new Subject().asObservable();

    const actionFop = this.flattenOp[
      (this.options && this.options.actionFop) || FlattenOps.concatMap
    ];

    const stateFop = this.flattenOp[
      (this.options && this.options.stateFop) || FlattenOps.switchMap
    ];

    //State observable
    this.state$ = combineLatest(initialState$, metaReducers$).pipe(
      map(([i, m]) => scan(reducerFactory(m), i)),
      switchMap(reducer =>
        actions$.pipe(
          filter(a => !!a),
          mapToObservable,
          actionFop((a: Observable<ActionsUnion>) => a.pipe(catchErr)),
          reducer,
          mapToObservable
        )
      ),
      startWith(initialState$),
      stateFop((state: Observable<State>) => state.pipe(catchErr)),
      takeUntil<State>(destroy$),
      shareReplay(1)
    );

    this.state$.subscribe();
  }
}
