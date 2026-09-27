"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduceA = exports.reduceNS = exports.reducePS = exports.filterA = exports.filterNS = exports.filterPS = exports.mapA = exports.mapNS = exports.mapPS = void 0;
/**
 *
 * @param mapFn - a function to map a state with
 * @returns {MiddlewareFn} MiddlewareFn<State>
 *
 * PS - previous state
 * NS - next state
 */
const mapPS = (mapFn) => (reducer) => (state, Action) => reducer(mapFn(state), Action);
exports.mapPS = mapPS;
const mapNS = (mapFn) => (reducer) => (state, Action) => mapFn(reducer(state, Action));
exports.mapNS = mapNS;
/**
 *
 * @param mapFn - a function to map an Action with
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
const mapA = (mapFn) => (reducer) => (state, Action) => reducer(state, mapFn(Action));
exports.mapA = mapA;
/**
 *
 * @param filterFn - a function to filter a state with
 * @returns {MiddlewareFn} MiddlewareFn<State>
 *
 * PS - previous state
 * NS - next state
 */
const filterPS = (filterFn) => (reducer) => (state, Action) => {
    return filterFn(state) ? reducer(state, Action) : state;
};
exports.filterPS = filterPS;
const filterNS = (filterFn) => (reducer) => (state, Action) => {
    const nextState = reducer(state, Action);
    return filterFn(nextState) ? nextState : state;
};
exports.filterNS = filterNS;
/**
 *
 * @param filterFn - a function to filter an Action with
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
const filterA = (filterFn) => (reducer) => (state, Action) => {
    return filterFn(Action) ? reducer(state, Action) : state;
};
exports.filterA = filterA;
/**
 * Reduce into state
 * @param reduceFn - a function to reduce the state and Action together
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 *
 * PS - previous state
 * NS - next state
 */
const reducePS = (reducerFn) => (reducer) => (state, Action) => {
    return reducer(reducerFn(state, Action), Action);
};
exports.reducePS = reducePS;
const reduceNS = (reducerFn) => (reducer) => (state, Action) => {
    return reducerFn(reducer(state, Action), Action);
};
exports.reduceNS = reduceNS;
/**
 *
 * Reduce into Action
 * @param reduceFn - a function to reduce the state and Action together
 * @returns {MiddlewareFn} MiddlewareFn<State, IActionsUnion>
 */
const reduceA = (reducerFn) => (reducer) => (state, Action) => {
    return reducer(state, reducerFn(state, Action));
};
exports.reduceA = reduceA;
