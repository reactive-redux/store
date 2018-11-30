import { Observable, of, combineLatest, ReplaySubject, from } from 'rxjs';
import {
  scan,
  startWith,
  shareReplay,
  takeUntil,
  mergeMap,
  switchMap,
  map
} from 'rxjs/operators';

import { reducerFactory } from './reducer.factory';
import { Action, ActionMap, MetaReducerMap } from './interfaces';

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
      this.replayStateSubject$,
      this.config.actionReducerMap$,
      this.config.metaReducerMap$,
      (replayState, a, m) => scan(reducerFactory(a, m), replayState)
    ).pipe(
      switchMap(scanReducer =>
        this.config.actionsSource$.pipe(
          scanReducer,
          map(state =>
            state instanceof Promise || state instanceof Observable
              ? from(state)
              : of(state)
          )
        )
      ),
      startWith(this.config.initialState$),
      mergeMap(state => state),
      takeUntil(this.config.onDestroy$),
      shareReplay(1)
    );

    this.state$.subscribe(this.replayStateSubject$);
  }
}
