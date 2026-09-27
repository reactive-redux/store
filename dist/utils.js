"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToObservable = exports.flatCatch = exports.catchErr = exports.compose = exports.hasType = exports.isObject = void 0;
exports.combineReducers = combineReducers;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const isObject = (value) => value !== null && typeof value === 'object';
exports.isObject = isObject;
const hasType = (action) => typeof action.type === 'string';
exports.hasType = hasType;
const compose = (fns) => fns.reduce((f, g) => (...args) => f(g(...args)));
exports.compose = compose;
exports.catchErr = (0, rxjs_1.pipe)((0, operators_1.catchError)((e) => (0, rxjs_1.of)(e)));
const flatCatch = (o) => o.pipe(exports.catchErr);
exports.flatCatch = flatCatch;
const mapToObservable = (value) => {
    if ((0, rxjs_1.isObservable)(value))
        return value;
    if (value instanceof Promise)
        return (0, rxjs_1.from)(value);
    return (0, rxjs_1.of)(value);
};
exports.mapToObservable = mapToObservable;
function combineReducers(reducers) {
    return (state = {}, action) => {
        const { hasChanged, nextState } = Object.entries(reducers).reduce(({ hasChanged, nextState }, [key, reducer]) => {
            const prev = state[key];
            const next = reducer(prev, action);
            return {
                hasChanged: hasChanged || next !== prev,
                nextState: Object.assign(Object.assign({}, nextState), { [key]: next }),
            };
        }, { hasChanged: false, nextState: {} });
        return hasChanged ? nextState : state;
    };
}
