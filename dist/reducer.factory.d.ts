import { MiddlewareFn, ReducerFn, IAction } from 'src/interfaces';
export declare function reducerFactory$<State>([initialState, reducer, middleware,]: [State, ReducerFn<State, any>, MiddlewareFn<State, any>[]]): import("rxjs").OperatorFunction<IAction<any>, State>;
