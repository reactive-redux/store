import { Observable, of, combineLatest } from 'rxjs';
import {
  scan,
  startWith,
  shareReplay,
  takeUntil,
  switchMap,
  map,
  catchError,
  concatMap,
  mergeMap,
  exhaustMap,
  filter
} from 'rxjs/operators';

import { reducerFactory } from './reducer.factory';
import {
  Action,
  ActionMap,
  MetaReducerMap,
  FlattenOps
} from './interfaces';
import { mapToObservable } from './utils';

/**
 * State container based on RxJS observables
 *
 *
 *
 * @class AsyncStore<State, ActionsUnion>
 */

export class AsyncStore<State, ActionsUnion extends Action> {
  public state$: Observable<State>;

  private flattenOp: { [key in FlattenOps]: any } = {
    switchMap,
    mergeMap,
    concatMap,
    exhaustMap
  };

  constructor(
    private config: {
      initialState$: Observable<State>;
      actionMap$: Observable<ActionMap<State, ActionsUnion>>;
      metaMap$: Observable<MetaReducerMap<State, ActionsUnion>>;
      actionQ$: Observable<
        ActionsUnion | Promise<ActionsUnion> | Observable<ActionsUnion>
      >;
      onDestroy$: Observable<boolean>;
    },
    private options?: {
      actionFop?: FlattenOps;
      stateFop?: FlattenOps;
    }
  ) {
    const actionFop = this.flattenOp[
      (this.options && this.options.actionFop) || FlattenOps.concatMap
    ];
    const stateFop = this.flattenOp[
      (this.options && this.options.stateFop) || FlattenOps.switchMap
    ];

    this.state$ = combineLatest(
      this.config.initialState$.pipe(catchError(e => of(e))),
      this.config.actionMap$.pipe(catchError(e => of(e))),
      this.config.metaMap$.pipe(catchError(e => of(e)))
    ).pipe(
      map(([i, a, m]) => scan(reducerFactory(a, m), i)),
      switchMap(reducer =>
        this.config.actionQ$.pipe(
          filter(a => !!a),
          mapToObservable,
          actionFop((a: Observable<ActionsUnion>) =>
            a.pipe(catchError(e => of(e)))
          ),
          reducer,
          mapToObservable
        )
      ),
      startWith(this.config.initialState$),
      stateFop((state: Observable<State>) =>
        state.pipe(catchError(e => of(e)))
      ),
      takeUntil<State>(this.config.onDestroy$),
      shareReplay(1)
    );

    this.state$.subscribe();
  }
}
