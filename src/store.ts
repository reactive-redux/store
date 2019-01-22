import { Observable, of, combineLatest } from 'rxjs';
import {
  scan,
  startWith,
  shareReplay,
  takeUntil,
  switchMap,
  map,
  catchError,
  concatMap
} from 'rxjs/operators';

import { reducerFactory } from './reducer.factory';
import { Action, ActionMap, MetaReducerMap } from './interfaces';
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

  constructor(
    private config: {
      initialState$: Observable<State>;
      actionMap$: Observable<ActionMap<State, ActionsUnion>>;
      metaMap$: Observable<MetaReducerMap<State, ActionsUnion>>;
      actionQ$: Observable<
        ActionsUnion | Promise<ActionsUnion> | Observable<ActionsUnion>
      >;
      onDestroy$: Observable<boolean>;
    }
  ) {
    this.state$ = combineLatest(
      this.config.initialState$.pipe(catchError(e => of(e))),
      this.config.actionMap$.pipe(catchError(e => of(e))),
      this.config.metaMap$.pipe(catchError(e => of(e)))
    ).pipe(
      map(([i, a, m]) => scan(reducerFactory(a, m), i)),
      switchMap(reducer =>
        this.config.actionQ$.pipe(
          mapToObservable,
          concatMap(a => a.pipe(catchError(e => of(e)))),
          reducer,
          mapToObservable
        )
      ),
      startWith(this.config.initialState$),
      switchMap<Observable<State>, State>(state =>
        state.pipe(catchError(e => of(e)))
      ),
      takeUntil(this.config.onDestroy$),
      shareReplay(1)
    );

    this.state$.subscribe();
  }
}
