import { Observable, OperatorFunction } from 'rxjs';
import { AsyncType, ActionMap, IAction, ActionCreator } from './interfaces';
export declare const isObject: (value: any) => boolean;
export declare const hasType: (action: any) => boolean;
export declare const isValidAction: <State, ActionsUnion extends IAction>(action: ActionsUnion, map: ActionMap<State, ActionsUnion>) => boolean;
export declare const _pipe: (fns: any[]) => any;
export declare const catchErr: import("rxjs").UnaryFunction<Observable<{}>, Observable<any>>;
export declare const flatCatch: <T>(o: Observable<T>) => Observable<T>;
export declare const mapToObservable: <T>(value: AsyncType<T>) => Observable<T>;
export declare function ofType<T extends IAction>(...allowedTypes: string[]): OperatorFunction<IAction, T>;
export declare const createActions: ActionCreator;
