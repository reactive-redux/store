import { Observable } from 'rxjs';
import { ReducerFn, IAction, AsyncType } from './interfaces';
export declare function isAction(action: any): boolean;
export declare function isValidAction(action: IAction, map: {
    [key: string]: ReducerFn<any>;
}): boolean;
export declare const _pipe: (fns: any[]) => any;
export declare const catchErr: import("rxjs").UnaryFunction<Observable<{}>, Observable<any>>;
export declare const flattenObservable: <T>(o: Observable<T>) => Observable<T>;
export declare function mapToObservable<T>(): import("rxjs").UnaryFunction<Observable<AsyncType<T>>, Observable<Observable<T>>>;
export declare const mapS: <State>(mapFn: (state: State) => State) => (reducer: ReducerFn<State>) => (state: State, action: IAction) => State;
export declare const mapA: <State, A extends IAction>(mapFn: (action: A) => A) => (reducer: ReducerFn<State>) => (state: State, action: A) => State;
export declare const filterS: <State>(predicate: (state: State) => boolean) => (reducer: ReducerFn<State>) => (state: State, action: IAction) => State;
export declare const filterA: <State, A extends IAction>(predicate: (action: A) => boolean) => (reducer: ReducerFn<State>) => (state: State, action: A) => State;
