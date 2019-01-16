"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function reducerFactory(actionMap, metaReducersMap) {
    var metaReducers = Object.keys(metaReducersMap).map(function (key) { return metaReducersMap[key]; });
    var hasMeta = metaReducers.length > 0;
    return function (state, action) {
        if (!action.type || !actionMap[action.type])
            return state;
        var reducerFn = actionMap[action.type] || (function (state) { return state; });
        return hasMeta
            ? utils_1.compose(metaReducers)(reducerFn)(state, action)
            : reducerFn(state, action);
    };
}
exports.reducerFactory = reducerFactory;
