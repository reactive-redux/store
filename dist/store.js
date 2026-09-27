"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
exports.createStore = createStore;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const reducer_factory_1 = require("./reducer.factory");
const defaults_1 = require("./defaults");
const devtools_1 = require("./devtools");
/**
 * Reactive state container based on RxJS (https://rxjs.dev/)
 *
 * @class AsyncStore<State, ActionsUnion>
 *
 * @type State - application state interface
 * @type ActionsUnion - type union of all the actions
 */
class Store {
    /**
     * Default configuration
     *
     * @param {Object} config
     *  {
     *     reducer$: of(reducer({})),
     *     actionStream$: EMPTY, // if not defined, no actions will be dispatched in the store
     *     initialState$: of({}),
     *     middleware$: of([]),
     *     destroy$: NEVER // if not defined, the state subscription will live forever
     *  }
     *
     * @param {Object} options
     *  {
     *     actionFop: FlattenOps.concatMap, // Flatten operator for actions's stream.
     *     stateFop: FlattenOps.switchMap // Flatten operator for state's stream.
     *     windowTime: undefined //Maximum time length of the replay buffer in milliseconds.
     *     bufferSize: 1 //Maximum element count of the replay buffer.
     *  }
     */
    constructor(config, options) {
        var _a, _b, _c, _d;
        this.config = config;
        this.options = options;
        this._dispatch$ = new rxjs_1.Subject();
        this.dispatch = (action) => {
            this._dispatch$.next(action);
        };
        // Wrap the reducer before getDefaults consumes it, so DevTools
        // time-travel jumps are honored even with the default identity reducer.
        const devToolsOptions = (0, devtools_1.normalizeDevToolsConfig)((_a = this.config) === null || _a === void 0 ? void 0 : _a.devTools);
        if (devToolsOptions) {
            this.config = Object.assign(Object.assign({}, this.config), { reducer$: ((_c = (_b = this.config) === null || _b === void 0 ? void 0 : _b.reducer$) !== null && _c !== void 0 ? _c : (0, rxjs_1.of)(state => state)).pipe((0, operators_1.map)(reducerFn => (0, devtools_1.withDevToolsTimeTravel)(reducerFn))) });
        }
        const { reducer$, actions$, actionStream$, middleware$, initialState$, destroy$, flattenState$, shareReplayConfig } = (0, defaults_1.getDefaults)(this.config, this.options, this._dispatch$);
        this.state$ = (0, rxjs_1.combineLatest)([initialState$, reducer$, middleware$]).pipe((0, operators_1.map)(reducer_factory_1.reducerFactory$), (0, operators_1.concatMap)(actionStream$), (0, operators_1.startWith)(initialState$), flattenState$, (0, operators_1.takeUntil)(destroy$), (0, operators_1.shareReplay)(shareReplayConfig));
        this.state$.subscribe();
        this.actions$ = actions$.pipe((0, operators_1.shareReplay)(shareReplayConfig));
        // Wire up epic$ if provided
        if ((_d = this.config) === null || _d === void 0 ? void 0 : _d.epic$) {
            this.config
                .epic$(this.actions$, this.state$)
                .pipe((0, operators_1.takeUntil)(destroy$))
                .subscribe({
                next: (action) => this.dispatch(action),
                error: (err) => console.error('[Epic] Error:', err),
            });
        }
        if (devToolsOptions) {
            const disconnect = (0, devtools_1.connectReduxDevTools)(this, devToolsOptions);
            // Mirror takeUntil(destroy$): the first emission tears the store down.
            destroy$.subscribe(() => disconnect());
        }
    }
}
exports.Store = Store;
function createStore(config = {}, opts = {}) {
    return new Store(config, opts);
}
