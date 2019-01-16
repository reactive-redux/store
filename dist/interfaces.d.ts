export declare type StringType = string;
export interface Action {
    type: string;
    payload?: any;
}
export declare type ReducerFn<State> = (state: State, action: Action) => State;
export declare type ActionMap<ActionsEnum extends StringType, State> = {
    [key: string]: ReducerFn<State>;
};
export declare type MetaReducerFn<State> = (reducer: ReducerFn<State>) => (state: State, action: Action) => State;
export declare type MetaReducerMap<T> = {
    [key: string]: MetaReducerFn<T>;
};
