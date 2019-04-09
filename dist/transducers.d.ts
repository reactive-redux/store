import { ReducerFn, IAction } from './interfaces';
/**
 *
 * @param mapFn - a function to map a state with
 * @returns {TransducerFn} TransducerFn<State>
 *
 * PS - previous state
 * NS - next state
 */
export declare const mapPS: <State, A extends IAction>(mapFn: (state: State) => State) => (reducer: ReducerFn<State, A>) => (state: State, action: A) => State;
export declare const mapNS: <State, A extends IAction>(mapFn: (state: State) => State) => (reducer: ReducerFn<State, A>) => (state: State, action: A) => State;
/**
 *
 * @param mapFn - a function to map an action with
 * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
 */
export declare const mapA: <State, A extends IAction>(mapFn: (action: A) => A) => (reducer: ReducerFn<State, A>) => (state: State, action: A) => State;
/**
 *
 * @param filterFn - a function to filter a state with
 * @returns {TransducerFn} TransducerFn<State>
 *
 * PS - previous state
 * NS - next state
 */
export declare const filterPS: <State, A extends IAction>(filterFn: (state: State) => boolean) => (reducer: ReducerFn<State, A>) => (state: State, action: A) => State;
export declare const filterNS: <State, A extends IAction>(filterFn: (state: State) => boolean) => (reducer: ReducerFn<State, A>) => (state: State, action: A) => State;
/**
 *
 * @param filterFn - a function to filter an action with
 * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
 */
export declare const filterA: <State, A extends IAction>(filterFn: (action: A) => boolean) => (reducer: ReducerFn<State, A>) => (state: State, action: A) => State;
/**
 * Reduce into state
 * @param reduceFn - a function to reduce the state and action together
 * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
 *
 * PS - previous state
 * NS - next state
 */
export declare const reducePS: <State, A extends IAction>(reducerFn: (state: State, action: A) => State) => (reducer: ReducerFn<State, A>) => (state: State, action: A) => State;
export declare const reduceNS: <State, A extends IAction>(reducerFn: (state: State, action: A) => State) => (reducer: ReducerFn<State, A>) => (state: State, action: A) => State;
/**
 *
 * Reduce into action
 * @param reduceFn - a function to reduce the state and action together
 * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
 */
export declare const reduceA: <State, A extends IAction>(reducerFn: (state: State, action: A) => A) => (reducer: ReducerFn<State, A>) => (state: State, action: A) => State;
