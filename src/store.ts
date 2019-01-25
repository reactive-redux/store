import { Observable, combineLatest } from 'rxjs';
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
  ActionMap,
  MetaReducerMap,
  FlattenOps,
  AsyncType
} from './interfaces';
import { mapToObservable, catchErr } from './utils';
import { ActionMonad } from './action.monad';

/**
 * State container based on RxJS observables
 *
 *
 *
 * @class AsyncStore<State, ActionsUnion>
 */

export class AsyncStore<State, ActionsUnion> {
  public state$: Observable<State>;

  private flattenOp: { [key in FlattenOps]: any } = {
    switchMap,
    mergeMap,
    concatMap,
    exhaustMap
  };

  constructor(
    private config: {
      initialState$: Observable<AsyncType<State>>;
      actionMap$: Observable<ActionMap<State, ActionMonad<State>> | {}>;
      metaMap$: Observable<MetaReducerMap<State, ActionsUnion> | {}>;
      actionQ$: Observable<AsyncType<ActionsUnion>>;
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
      this.config.initialState$.pipe(catchErr),
      this.config.actionMap$.pipe(catchErr),
      this.config.metaMap$.pipe(catchErr)
    ).pipe(
      map(([i, a, m]) => scan(reducerFactory(a, m), i)),
      switchMap(reducer =>
        this.config.actionQ$.pipe(
          filter(a => !!a),
          mapToObservable,
          actionFop((a: Observable<ActionsUnion>) => a.pipe(catchErr)),
          reducer,
          mapToObservable
        )
      ),
      startWith(this.config.initialState$),
      stateFop((state: Observable<State>) => state.pipe(catchErr)),
      takeUntil<State>(this.config.onDestroy$),
      shareReplay(1)
    );

    this.state$.subscribe();
  }
}
