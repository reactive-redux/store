import { Observable, of, combineLatest, ReplaySubject } from 'rxjs';
import {
  scan,
  startWith,
  shareReplay,
  takeUntil,
  switchMap,
  map,
  take,
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
 * @class AsyncStore<State, ActionUnion>
 */

export class AsyncStore<State, ActionsUnion extends Action> {
  private replayStateSubject$: ReplaySubject<State>;
  public state$: Observable<State>;

  constructor(
    private config: {
      initialState$: Observable<State>;
      actionMap$: Observable<ActionMap<ActionsUnion['type'], State>>;
      metaMap$: Observable<MetaReducerMap<State>>;
      actionQ$: Observable<
        | ActionsUnion
        | Promise<ActionsUnion>
        | Observable<ActionsUnion>
      >;
      onDestroy$: Observable<boolean>;
    }
  ) {
    this.replayStateSubject$ = new ReplaySubject(1);

    this.state$ = combineLatest(
      this.config.actionMap$,
      this.config.metaMap$
    ).pipe(
      switchMap(([a, m]) =>
        this.replayStateSubject$.pipe(
          take(1),
          map(state => scan(reducerFactory(a, m), state))
        )
      ),
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

    this.state$.subscribe(this.replayStateSubject$);
  }
}
