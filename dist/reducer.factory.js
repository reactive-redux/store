"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reducerFactory$ = reducerFactory$;
const operators_1 = require("rxjs/operators");
const utils_1 = require("./utils");
function reducerFactory$([initialState, reducer, middleware,]) {
    function _reducer(state, action) {
        return middleware.length > 0
            ? (0, utils_1.compose)(middleware)(reducer)(state, action)
            : reducer(state, action);
    }
    return (0, operators_1.scan)(_reducer, initialState);
}
