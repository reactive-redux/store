export interface Action {
  type: string;
  payload?: any;
}

export type ReducerFn<State, ActionsUnion> = (
  state: State,
  action: ActionsUnion
) => State;

export type ActionMap<
  State,
  ActionsUnion,
  ActionsEnum extends string
> = { [key in ActionsEnum]: ReducerFn<State, ActionsUnion> };

export type MetaReducerFn<State, ActionsUnion> = (
  reducer: ReducerFn<State, ActionsUnion>
) => (state: State, action: ActionsUnion) => State;

export type MetaReducerMap<T, U> = {
  [key: string]: MetaReducerFn<T, U>;
};
