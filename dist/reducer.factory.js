"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function reducerFactory(actionMap, metaReducersMap) {
    return function (state, action) {
        if (!action.type || !actionMap[action.type])
            return state;
        var reducerFn = actionMap[action.type] || (function (state) { return state; });
        var metaReducers = Object.keys(metaReducersMap).map(function (key) { return metaReducersMap[key]; });
        return metaReducers.length > 0
            ? utils_1.compose(metaReducers)(reducerFn)(state, action)
            : reducerFn(state, action);
    };
}
exports.reducerFactory = reducerFactory;
