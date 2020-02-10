import { Reducer } from 'ts-action';
export declare function reducerFactory$<State>([initialState, reducer, middleware,]: [State, Reducer<State>, any[]]): import("rxjs").OperatorFunction<any, State>;
