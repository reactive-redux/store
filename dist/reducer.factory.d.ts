import { MiddlewareFn, ReducerFn, IAction } from './interfaces';
export declare function reducerFactory$<State>([initialState, reducer, middleware,]: [State, ReducerFn<State, any>, MiddlewareFn<State, any>[]]): import("rxjs").OperatorFunction<IAction<any>, State>;
