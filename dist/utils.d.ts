import { ReducerFn, IAction } from './interfaces';
export declare const compose: (fns: any[]) => any;
export declare const catchErr: import("rxjs").UnaryFunction<import("rxjs").Observable<{}>, import("rxjs").Observable<any>>;
export declare const mapToObservable: import("rxjs").UnaryFunction<import("rxjs").Observable<{}>, import("rxjs").Observable<import("rxjs").Observable<any>>>;
export declare const metaMapS: <State>(mapFn: (state: State) => State) => (reducer: ReducerFn<State>) => (state: State, action: IAction) => State;
export declare const metaMapA: <State, A extends IAction>(mapFn: (action: A) => A) => (reducer: ReducerFn<State>) => (state: State, action: A) => State;
export declare const metaFilterS: <State>(predicate: (state: State) => boolean) => (reducer: ReducerFn<State>) => (state: State, action: IAction) => State;
export declare const metaFilterA: <State, A extends IAction>(predicate: (action: A) => boolean) => (reducer: ReducerFn<State>) => (state: State, action: A) => State;
