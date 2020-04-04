import { ReducerFn, IAction } from './interfaces';
/**
 *
 * @param mapFn - a function to map a state with
 * @returns {MiddlewareFn} MiddlewareFn<State>
 *
 * PS - previous state
 * NS - next state
 */
export declare const mapPS: <State, A extends IAction>(mapFn: (state: State) => State) => (reducer: ReducerFn<State, A>) => (state: State, IAction: A) => State;
export declare const mapNS: <State, A extends IAction>(mapFn: (state: State) => State) => (reducer: ReducerFn<State, A>) => (state: State, IAction: A) => State;
/**
 *
 * @param mapFn - a function to map an IAction with
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
export declare const mapA: <State, A extends IAction>(mapFn: (IAction: A) => A) => (reducer: ReducerFn<State, A>) => (state: State, IAction: A) => State;
/**
 *
 * @param filterFn - a function to filter a state with
 * @returns {MiddlewareFn} MiddlewareFn<State>
 *
 * PS - previous state
 * NS - next state
 */
export declare const filterPS: <State, A extends IAction>(filterFn: (state: State) => boolean) => (reducer: ReducerFn<State, A>) => (state: State, IAction: A) => State;
export declare const filterNS: <State, A extends IAction>(filterFn: (state: State) => boolean) => (reducer: ReducerFn<State, A>) => (state: State, IAction: A) => State;
/**
 *
 * @param filterFn - a function to filter an IAction with
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
export declare const filterA: <State, A extends IAction>(filterFn: (IAction: A) => boolean) => (reducer: ReducerFn<State, A>) => (state: State, IAction: A) => State;
/**
 * Reduce into state
 * @param reduceFn - a function to reduce the state and IAction together
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 *
 * PS - previous state
 * NS - next state
 */
export declare const reducePS: <State, A extends IAction>(reducerFn: (state: State, IAction: A) => State) => (reducer: ReducerFn<State, A>) => (state: State, IAction: A) => State;
export declare const reduceNS: <State, A extends IAction>(reducerFn: (state: State, IAction: A) => State) => (reducer: ReducerFn<State, A>) => (state: State, IAction: A) => State;
/**
 *
 * Reduce into IAction
 * @param reduceFn - a function to reduce the state and IAction together
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
export declare const reduceA: <State, A extends IAction>(reducerFn: (state: State, IAction: A) => A) => (reducer: ReducerFn<State, A>) => (state: State, IAction: A) => State;
