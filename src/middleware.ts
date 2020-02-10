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
) => (state: State, action: A) => reducer(mapFn(state), action);

export const mapNS = <State, A extends Action>(mapFn: (state: State) => State) => (
  reducer: ReducerFn<State, A>
) => (state: State, action: A) => mapFn(reducer(state, action));

/**
 *
 * @param mapFn - a function to map an action with
 * @returns {MiddlewareFn} MiddlewareFn<State, ActionsUnion>
 */
export const mapA = <State, A extends Action>(mapFn: (action: A) => A) => (
  reducer: ReducerFn<State, A>
) => (state: State, action: A) => reducer(state, mapFn(action));

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
) => (state: State, action: A) => {
  return filterFn(state) ? reducer(state, action) : state;
};

export const filterNS = <State, A extends Action>(filterFn: (state: State) => boolean) => (
  reducer: ReducerFn<State, A>
) => (state: State, action: A) => {
  const nextState = reducer(state, action);
  return filterFn(nextState) ? nextState : state;
};

/**
 *
 * @param filterFn - a function to filter an action with
 * @returns {MiddlewareFn} MiddlewareFn<State, ActionsUnion>
 */
export const filterA = <State, A extends Action>(
  filterFn: (action: A) => boolean
) => (reducer: ReducerFn<State, A>) => (state: State, action: A) => {
  return filterFn(action) ? reducer(state, action) : state;
};

/**
 * Reduce into state
 * @param reduceFn - a function to reduce the state and action together
 * @returns {MiddlewareFn} MiddlewareFn<State, ActionsUnion>
 *
 * PS - previous state
 * NS - next state
 */
export const reducePS = <State, A extends Action>(
  reducerFn: (state: State, action: A) => State
) => (reducer: ReducerFn<State, A>) => (state: State, action: A) => {
  return reducer(reducerFn(state, action), action);
};

export const reduceNS = <State, A extends Action>(
  reducerFn: (state: State, action: A) => State
) => (reducer: ReducerFn<State, A>) => (state: State, action: A) => {
  return reducerFn(reducer(state, action), action);
};

/**
 *
 * Reduce into action
 * @param reduceFn - a function to reduce the state and action together
 * @returns {MiddlewareFn} MiddlewareFn<State, ActionsUnion>
 */
export const reduceA = <State, A extends Action>(
  reducerFn: (state: State, action: A) => A
) => (reducer: ReducerFn<State, A>) => (state: State, action: A) => {
  return reducer(state, reducerFn(state, action));
};