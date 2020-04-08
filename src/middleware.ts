import { ReducerFn, MiddlewareFn } from './interfaces';
import { Action } from 'ts-action';

/**
 *
 * @param mapFn - a function to map a state with
 * @returns {MiddlewareFn} MiddlewareFn<State>
 *
 * PS - previous state
 * NS - next state
 */
export const mapPS = <State, A extends Action>(mapFn: (state: State) => State) => (
  reducer: ReducerFn<State, A>
) => (state: State, Action: A) => reducer(mapFn(state), Action);

export const mapNS = <State, A extends Action>(mapFn: (state: State) => State) => (
  reducer: ReducerFn<State, A>
) => (state: State, Action: A) => mapFn(reducer(state, Action));

/**
 *
 * @param mapFn - a function to map an Action with
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
export const mapA = <State, A extends Action>(mapFn: (Action: A) => A) => (
  reducer: ReducerFn<State, A>
) => (state: State, Action: A) => reducer(state, mapFn(Action));

/**
 *
 * @param filterFn - a function to filter a state with
 * @returns {MiddlewareFn} MiddlewareFn<State>
 *
 * PS - previous state
 * NS - next state
 */
export const filterPS = <State, A extends Action>(filterFn: (state: State) => boolean) => (
  reducer: ReducerFn<State, A>
) => (state: State, Action: A) => {
  return filterFn(state) ? reducer(state, Action) : state;
};

export const filterNS = <State, A extends Action>(filterFn: (state: State) => boolean) => (
  reducer: ReducerFn<State, A>
) => (state: State, Action: A) => {
  const nextState = reducer(state, Action);
  return filterFn(nextState) ? nextState : state;
};

/**
 *
 * @param filterFn - a function to filter an Action with
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
export const filterA = <State, A extends Action>(
  filterFn: (Action: A) => boolean
) => (reducer: ReducerFn<State, A>) => (state: State, Action: A) => {
  return filterFn(Action) ? reducer(state, Action) : state;
};

/**
 * Reduce into state
 * @param reduceFn - a function to reduce the state and Action together
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 *
 * PS - previous state
 * NS - next state
 */
export const reducePS = <State, A extends Action>(
  reducerFn: (state: State, Action: A) => State
) => (reducer: ReducerFn<State, A>) => (state: State, Action: A) => {
  return reducer(reducerFn(state, Action), Action);
};

export const reduceNS = <State, A extends Action>(
  reducerFn: (state: State, Action: A) => State
) => (reducer: ReducerFn<State, A>) => (state: State, Action: A) => {
  return reducerFn(reducer(state, Action), Action);
};

/**
 *
 * Reduce into Action
 * @param reduceFn - a function to reduce the state and Action together
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
export const reduceA = <State, A extends Action>(
  reducerFn: (state: State, Action: A) => A
) => (reducer: ReducerFn<State, A>) => (state: State, Action: A) => {
  return reducer(state, reducerFn(state, Action));
};
