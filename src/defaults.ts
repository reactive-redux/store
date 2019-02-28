import { Observable, of, EMPTY, NEVER } from 'rxjs';
import {
  ActionMap,
  AsyncType,
  FlattenOps,
  StoreConfig,
  StoreOptions,
  TransducerMap
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

  const transducers$ =
    (config &&
      config.transducers$ &&
      config.transducers$.pipe<TransducerMap<State>>(catchErr)) ||
    of({});

  const destroy$: Observable<boolean> =
    (config && config.destroy$ && config.destroy$.pipe(catchErr)) || NEVER;

  const actionFop =
    FlattenOperators[(options && options.actionFop) || FlattenOps.concatMap];

  const stateFop =
    FlattenOperators[(options && options.stateFop) || FlattenOps.switchMap];

  return {
    actionMap$,
    actions$,
    initialState$,
    transducers$,
    destroy$,
    actionFop,
    stateFop
  };
}
