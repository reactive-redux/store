import { AsyncType, IAction } from './interfaces';
import { Observable, OperatorFunction } from 'rxjs';
export declare function actionFactory<State, ActionsUnion extends IAction>(actions$: Observable<AsyncType<ActionsUnion>>, flatten: (a: Observable<ActionsUnion>) => OperatorFunction<Observable<ActionsUnion>, ActionsUnion>): (reducer: OperatorFunction<ActionsUnion, State>) => Observable<Observable<State>>;
