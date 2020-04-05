import { Observable, OperatorFunction } from 'rxjs';
import { AsyncType, IAction } from './interfaces';
export declare const isObject: (value: any) => boolean;
export declare const hasType: (action: any) => boolean;
export declare const compose: (fns: any[]) => any;
export declare const catchErr: import("rxjs").UnaryFunction<Observable<unknown>, Observable<any>>;
export declare const flatCatch: <T>(o: Observable<T>) => Observable<T>;
export declare const mapToObservable: <T>(value: AsyncType<T>) => Observable<T>;
export declare function ofType<T extends IAction>(...allowedTypes: string[]): OperatorFunction<IAction, T>;
