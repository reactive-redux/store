import { ReducerFn } from './interfaces';
export declare const compose: (fns: any[]) => any;
export declare const catchErr: import("rxjs/internal/types").UnaryFunction<import("rxjs/internal/Observable").Observable<{}>, import("rxjs/internal/Observable").Observable<any>>;
export declare const mapToObservable: import("rxjs/internal/types").UnaryFunction<import("rxjs/internal/Observable").Observable<{}>, import("rxjs/internal/Observable").Observable<import("rxjs/internal/Observable").Observable<any>>>;
export declare const mapMeta: <State>(mapFn: (state: State) => State) => (reducer: ReducerFn<State>) => (state: State) => State;
export declare const filterMeta: <State>(predicate: (state: State) => boolean) => (reducer: ReducerFn<State>) => (state: State) => State;
