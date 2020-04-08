import { MiddlewareFn, ReducerFn } from './interfaces';
import { Action } from 'ts-action';
export declare function reducerFactory$<State>([initialState, reducer, middleware,]: [State, ReducerFn<State, any>, MiddlewareFn<State, any>[]]): import("rxjs").OperatorFunction<Action<string>, State>;
