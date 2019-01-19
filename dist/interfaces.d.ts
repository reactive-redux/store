export interface Action {
    type: string;
    payload?: any;
}
export declare type ReducerFn<State, ActionsUnion> = (state: State, action: ActionsUnion) => State;
export declare type ActionMap<State, ActionsUnion, ActionsEnum extends string> = {
    [key in ActionsEnum]: ReducerFn<State, ActionsUnion>;
};
export declare type MetaReducerFn<State, ActionsUnion> = (reducer: ReducerFn<State, ActionsUnion>) => (state: State, action: ActionsUnion) => State;
export declare type MetaReducerMap<T, U> = {
    [key: string]: MetaReducerFn<T, U>;
};
