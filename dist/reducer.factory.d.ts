import { Reducer, Action } from 'ts-action';
import { MiddlewareFn } from 'src/interfaces';
export declare function reducerFactory$<State>([initialState, reducer, middleware,]: [State, Reducer<State>, MiddlewareFn<State, any>[]]): import("rxjs").OperatorFunction<Action<string>, State>;
