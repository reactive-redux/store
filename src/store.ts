import { Observable, of, combineLatest, ReplaySubject } from 'rxjs';
import {
  scan,
  startWith,
  shareReplay,
  takeUntil,
  mergeMap,
  switchMap,
  map,
  take,
  catchError,
  concatMap
} from 'rxjs/operators';

import { reducerFactory } from './reducer.factory';
import { Action, ActionMap, MetaReducerMap } from './interfaces';
import { mapToObservable } from './utils';

export class AsyncStore<State, ActionsUnion extends Action> {
  private replayStateSubject$: ReplaySubject<State>;
  public state$: Observable<State>;

  constructor(
    private config: {
      initialState$: Observable<State>;
      actionReducerMap$: Observable<ActionMap<ActionsUnion['type'], State>>;
      metaReducerMap$: Observable<MetaReducerMap<State>>;
      actionsSource$: Observable<ActionsUnion>;
      onDestroy$: Observable<boolean>;
    }
  ) {
    this.replayStateSubject$ = new ReplaySubject(1);

    this.state$ = combineLatest(
      this.config.actionReducerMap$,
      this.config.metaReducerMap$
    ).pipe(
      switchMap(([a, m]) =>
        this.replayStateSubject$.pipe(
          take(1),
          map(state => scan(reducerFactory(a, m), state))
        )
      ),
      switchMap(scanReducer =>
        this.config.actionsSource$.pipe(
          mapToObservable,
          concatMap(a => a.pipe(catchError(e => of(e)))),
          scanReducer,
          mapToObservable
        )
      ),
      startWith(this.config.initialState$),
      mergeMap<Observable<State>, State>(state =>
        state.pipe(catchError(e => of(e)))
      ),
      takeUntil(this.config.onDestroy$),
      shareReplay(1)
    );

    this.state$.subscribe(this.replayStateSubject$);
  }
}
