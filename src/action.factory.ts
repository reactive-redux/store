import { filter } from 'rxjs/operators';
import { mapToObservable, flattenObservable, isObject } from './utils';
import { AsyncType, IAction } from './interfaces';
import { Observable, OperatorFunction } from 'rxjs';

// flatten: FlattenOperator from ./interfaces
export function actionFactory<State, ActionsUnion extends IAction>(
  actions$: Observable<AsyncType<ActionsUnion>>,
  flatten: (
    a: Observable<ActionsUnion>
  ) => OperatorFunction<Observable<ActionsUnion>, ActionsUnion>
) {
  return (reducer: OperatorFunction<ActionsUnion, State>) =>
    actions$.pipe(
      filter(isObject),
      mapToObservable(),
      flatten(<any>flattenObservable),
      reducer,
      mapToObservable()
    );
}
