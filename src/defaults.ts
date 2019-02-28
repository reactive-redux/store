import { Observable, of, EMPTY, NEVER } from 'rxjs';

import {
  ActionMap,
  MetaReducerMap,
  AsyncType,
  FlattenOps,
  StoreConfig,
  StoreOptions
} from './interfaces';
import { catchErr } from './utils';
import { switchMap, mergeMap, concatMap, exhaustMap } from 'rxjs/operators';

const FlattenOperators: { [key in FlattenOps]: any } = {
  switchMap,
  mergeMap,
  concatMap,
  exhaustMap
};

export function getDefaults<State, ActionsUnion>(
  config: StoreConfig<State, ActionsUnion> = {},
  options: StoreOptions = {}
) {
  const actionMap$: Observable<ActionMap<State>> =
    (config && config.actionMap$ && config.actionMap$.pipe(catchErr)) || of({});

  const actions$: Observable<AsyncType<ActionsUnion>> =
    (config && config.actions$ && config.actions$.pipe(catchErr)) || EMPTY;

  const initialState$: Observable<State> =
    (config && config.initialState$ && config.initialState$.pipe(catchErr)) ||
    of({});

  const metaReducers$ =
    (config &&
      config.metaReducers$ &&
      config.metaReducers$.pipe<MetaReducerMap<State>>(catchErr)) ||
    of({});

  const destroy$: Observable<boolean> =
    (config && config.onDestroy$ && config.onDestroy$.pipe(catchErr)) || NEVER;

  const actionFop =
    FlattenOperators[(options && options.actionFop) || FlattenOps.concatMap];

  const stateFop =
    FlattenOperators[(options && options.stateFop) || FlattenOps.switchMap];

  return {
    actionMap$,
    actions$,
    initialState$,
    metaReducers$,
    destroy$,
    actionFop,
    stateFop
  };
}
