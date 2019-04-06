import { filter } from 'rxjs/operators';
import { mapToObservable, flattenObservable, isObject } from './utils';
import { AsyncType, IAction } from './interfaces';
import { Observable, OperatorFunction } from 'rxjs';

// flatten: FlattenOperator from ./interfaces
export function actionFactory<State, ActionsUnion extends IAction>(
  actions$: Observable<AsyncType<ActionsUnion>>,
  flatten: any
) {
  return (reducer: OperatorFunction<ActionsUnion, State>) =>
    actions$.pipe(
      filter(isObject),
      mapToObservable(),
      flatten(flattenObservable),
      reducer,
      mapToObservable()
    );
}
