"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEVTOOLS_JUMP_TO_STATE = void 0;
exports.normalizeDevToolsConfig = normalizeDevToolsConfig;
exports.withDevToolsTimeTravel = withDevToolsTimeTravel;
exports.connectReduxDevTools = connectReduxDevTools;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
/**
 * Bridge between a Store and the Redux DevTools browser extension.
 *
 * The extension's `connect()` API is store-agnostic: any state container can
 * push `(action, resulting state)` pairs to it. We derive those pairs from
 * the store's public streams — `actions$` emits the action right before the
 * reducer runs, and `state$` emits the state produced by it, so
 * `state$.pipe(withLatestFrom(actions$))` yields each action next to the
 * state it created.
 *
 * Time travel (jumping to a previous action/state in the DevTools UI) works
 * by dispatching an internal action carrying the target state, honored by a
 * reducer wrapped with {@link withDevToolsTimeTravel}. The `devTools` option
 * on `createStore` applies the wrapper automatically.
 */
/** Internal action type used to apply a state chosen in the DevTools UI. */
exports.DEVTOOLS_JUMP_TO_STATE = '@@redux-devtools/JUMP_TO_STATE';
/** Resolve the toggle union to options-or-off. */
function normalizeDevToolsConfig(config) {
    if (!config) {
        return undefined;
    }
    const options = config === true ? {} : config;
    return options.enabled === false ? undefined : options;
}
/**
 * Wraps a reducer so the bridge can force the state to a snapshot chosen in
 * the DevTools UI (time travel). Applied automatically when the store is
 * created with the `devTools` config option.
 */
function withDevToolsTimeTravel(reducerFn) {
    return (state, action) => (action === null || action === void 0 ? void 0 : action.type) === exports.DEVTOOLS_JUMP_TO_STATE
        ? action.state
        : reducerFn(state, action);
}
/**
 * Streams every dispatched action and the state it produced to the Redux
 * DevTools extension. No-op when disabled or when the extension is absent
 * (including non-browser environments).
 *
 * Standalone variant — prefer the `devTools` option on `createStore`, which
 * also wraps the reducer for time travel and tears down on `destroy$`.
 * When using this directly, connect before dispatching any action and wrap
 * your reducer with {@link withDevToolsTimeTravel} if you want time travel.
 *
 * @returns teardown function that disconnects from the extension.
 */
function connectReduxDevTools(store, options = {}) {
    var _a, _b;
    const extension = globalThis.__REDUX_DEVTOOLS_EXTENSION__;
    if (options.enabled === false || !extension) {
        return () => undefined;
    }
    const devTools = extension.connect(Object.assign({ name: (_a = options.name) !== null && _a !== void 0 ? _a : 'RxDI Store', maxAge: (_b = options.maxAge) !== null && _b !== void 0 ? _b : 50 }, options.extensionOptions));
    const subscription = new rxjs_1.Subscription();
    // state$ replays its latest value synchronously on subscribe, so
    // currentState is populated before init() below.
    let currentState;
    subscription.add(store.state$.subscribe(state => {
        currentState = state;
    }));
    devTools.init(currentState);
    subscription.add(store.state$
        .pipe((0, operators_1.withLatestFrom)(store.actions$), 
    // Jumps come from the DevTools UI — echoing them back would
    // pollute the action log.
    (0, operators_1.filter)(([, action]) => action.type !== exports.DEVTOOLS_JUMP_TO_STATE))
        .subscribe(([state, action]) => devTools.send(action, state)));
    const unsubscribeMessages = devTools.subscribe(message => {
        var _a;
        if (message.type !== 'DISPATCH') {
            return;
        }
        const kind = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.type;
        if ((kind === 'JUMP_TO_ACTION' || kind === 'JUMP_TO_STATE') &&
            message.state) {
            store.dispatch({
                type: exports.DEVTOOLS_JUMP_TO_STATE,
                state: JSON.parse(message.state),
            });
        }
        else if (kind === 'COMMIT') {
            devTools.init(currentState);
        }
    });
    return () => {
        var _a;
        subscription.unsubscribe();
        if (typeof unsubscribeMessages === 'function') {
            unsubscribeMessages();
        }
        (_a = devTools.unsubscribe) === null || _a === void 0 ? void 0 : _a.call(devTools);
    };
}
