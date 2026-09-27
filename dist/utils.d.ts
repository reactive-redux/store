import { Observable } from 'rxjs';
import { AsyncType } from './interfaces';
import { Action } from 'ts-action';
export declare const isObject: (value: any) => boolean;
export declare const hasType: (action: any) => boolean;
export declare const compose: (fns: any[]) => any;
export declare const catchErr: import("rxjs").UnaryFunction<Observable<unknown>, Observable<any>>;
export declare const flatCatch: <T>(o: Observable<T>) => Observable<T>;
export declare const mapToObservable: <T>(value: AsyncType<T>) => Observable<T>;
export declare function combineReducers<S extends Record<string, any>, A extends Action>(reducers: {
    [K in keyof S]: (state: S[K], action: A) => S[K];
}): (state: S, action: A) => S;
