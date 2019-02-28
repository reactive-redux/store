import { ReducerFn, IAction } from "./interfaces";
/**
 *
 * @param mapFn - a function to map the state with
 * @returns {MetaReducerFn} MetaReducerFn<State>
 */
export declare const mapS: <State>(mapFn: (state: State) => State) => (reducer: ReducerFn<State>) => (state: State, action: IAction) => State;
/**
 *
 * @param mapFn - a function to map the action with
 * @returns {MetaReducerFn} MetaReducerFn<State>
 */
export declare const mapA: <State, A extends IAction>(mapFn: (action: A) => A) => (reducer: ReducerFn<State>) => (state: State, action: A) => State;
/**
 *
 * @param filterFn - a function to filter the state with
 * @returns {MetaReducerFn} MetaReducerFn<State>
 */
export declare const filterS: <State>(filterFn: (state: State) => boolean) => (reducer: ReducerFn<State>) => (state: State, action: IAction) => State;
/**
 *
 * @param filterFn - a function to filter the action with
 * @returns {MetaReducerFn} MetaReducerFn<State>
 */
export declare const filterA: <State, A extends IAction>(filterFn: (action: A) => boolean) => (reducer: ReducerFn<State>) => (state: State, action: A) => State;
