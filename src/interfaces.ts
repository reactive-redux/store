import { Observable } from 'rxjs';

export type StringType = string;

export interface Action {
  type: string;
  payload?: any;
}

export type ReducerFn<State> = (state: State, action: Action) => State;

export type ActionMap<ActionsEnum extends StringType, State> = {
  // [K in ActionsEnum]: ReducerFn<State>
  [key: string]: ReducerFn<State>;
};

export type MetaReducerFn<State> = (
  reducer: ReducerFn<State>
) => (state: State, action: Action) => State;

export type MetaReducerMap<T> = {
  [key: string]: MetaReducerFn<T>;
};
