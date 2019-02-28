import { ReducerFn, IAction, TransducerFn } from "./interfaces";

/**
 * 
 * @param mapFn - a function to map a state with
 * @returns {TransducerFn} TransducerFn<State>
 */
export const mapS = <State>(mapFn: (state: State) => State) => (
  reducer: ReducerFn<State>
) => (state: State, action: IAction) => mapFn(reducer(state, action));

/**
 * 
 * @param mapFn - a function to map an action with
 * @returns {TransducerFn} TransducerFn<State>
 */
export const mapA = <State, A extends IAction>(mapFn: (action: A) => A) => (
  reducer: ReducerFn<State>
) => (state: State, action: A) => reducer(state, mapFn(action));

/**
 * 
 * @param filterFn - a function to filter a state with
 * @returns {TransducerFn} TransducerFn<State>
 */
export const filterS = <State>(filterFn: (state: State) => boolean) => (
  reducer: ReducerFn<State>
) => (state: State, action: IAction) => {
  return filterFn(state) ? reducer(state, action) : state;
};

/**
 * 
 * @param filterFn - a function to filter an action with
 * @returns {TransducerFn} TransducerFn<State>
 */
export const filterA = <State, A extends IAction>(
  filterFn: (action: A) => boolean
) => (reducer: ReducerFn<State>) => (state: State, action: A) => {
  return filterFn(action) ? reducer(state, action) : state;
};
