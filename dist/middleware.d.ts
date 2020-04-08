import { ReducerFn } from './interfaces';
import { Action } from 'ts-action';
/**
 *
 * @param mapFn - a function to map a state with
 * @returns {MiddlewareFn} MiddlewareFn<State>
 *
 * PS - previous state
 * NS - next state
 */
export declare const mapPS: <State, A extends Action<string>>(mapFn: (state: State) => State) => (reducer: ReducerFn<State, A>) => (state: State, Action: A) => State;
export declare const mapNS: <State, A extends Action<string>>(mapFn: (state: State) => State) => (reducer: ReducerFn<State, A>) => (state: State, Action: A) => State;
/**
 *
 * @param mapFn - a function to map an Action with
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
export declare const mapA: <State, A extends Action<string>>(mapFn: (Action: A) => A) => (reducer: ReducerFn<State, A>) => (state: State, Action: A) => State;
/**
 *
 * @param filterFn - a function to filter a state with
 * @returns {MiddlewareFn} MiddlewareFn<State>
 *
 * PS - previous state
 * NS - next state
 */
export declare const filterPS: <State, A extends Action<string>>(filterFn: (state: State) => boolean) => (reducer: ReducerFn<State, A>) => (state: State, Action: A) => State;
export declare const filterNS: <State, A extends Action<string>>(filterFn: (state: State) => boolean) => (reducer: ReducerFn<State, A>) => (state: State, Action: A) => State;
/**
 *
 * @param filterFn - a function to filter an Action with
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
export declare const filterA: <State, A extends Action<string>>(filterFn: (Action: A) => boolean) => (reducer: ReducerFn<State, A>) => (state: State, Action: A) => State;
/**
 * Reduce into state
 * @param reduceFn - a function to reduce the state and Action together
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 *
 * PS - previous state
 * NS - next state
 */
export declare const reducePS: <State, A extends Action<string>>(reducerFn: (state: State, Action: A) => State) => (reducer: ReducerFn<State, A>) => (state: State, Action: A) => State;
export declare const reduceNS: <State, A extends Action<string>>(reducerFn: (state: State, Action: A) => State) => (reducer: ReducerFn<State, A>) => (state: State, Action: A) => State;
/**
 *
 * Reduce into Action
 * @param reduceFn - a function to reduce the state and Action together
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
export declare const reduceA: <State, A extends Action<string>>(reducerFn: (state: State, Action: A) => A) => (reducer: ReducerFn<State, A>) => (state: State, Action: A) => State;
