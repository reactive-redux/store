import { ReducerFn, IAction } from "./interfaces";
/**
 *
 * @param mapFn - a function to map a state with
 * @returns {TransducerFn} TransducerFn<State>
 */
export declare const mapS: <State>(mapFn: (state: State) => State) => (reducer: ReducerFn<State>) => (state: State, action: IAction) => State;
/**
 *
 * @param mapFn - a function to map an action with
 * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
 */
export declare const mapA: <State, A extends IAction>(mapFn: (action: A) => A) => (reducer: ReducerFn<State>) => (state: State, action: A) => State;
/**
 *
 * @param filterFn - a function to filter a state with
 * @returns {TransducerFn} TransducerFn<State>
 */
export declare const filterS: <State>(filterFn: (state: State) => boolean) => (reducer: ReducerFn<State>) => (state: State, action: IAction) => State;
/**
 *
 * @param filterFn - a function to filter an action with
 * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
 */
export declare const filterA: <State, A extends IAction>(filterFn: (action: A) => boolean) => (reducer: ReducerFn<State>) => (state: State, action: A) => State;
/**
 *
 * @param reduceFn - a function to reduce the state and action together
 * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
 */
export declare const reduceS: <State, A extends IAction>(reducerFn: (state: State, action: A) => State) => (reducer: ReducerFn<State>) => (state: State, action: A) => State;
/**
 *
 * @param reduceFn - a function to reduce the state and action together
 * @returns {TransducerFn} TransducerFn<State, ActionsUnion>
 */
export declare const reduceA: <State, A extends IAction>(reducerFn: (state: State, action: A) => A) => (reducer: ReducerFn<State>) => (state: State, action: A) => State;
