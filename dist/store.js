"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var reducer_factory_1 = require("./reducer.factory");
var AsyncStore = /** @class */ (function () {
    function AsyncStore(config) {
        var _this = this;
        this.config = config;
        this.replayStateSubject$ = new rxjs_1.ReplaySubject(1);
        this.state$ = rxjs_1.combineLatest(this.replayStateSubject$, this.config.actionReducerMap$, this.config.metaReducerMap$, function (replayState, a, m) { return operators_1.scan(reducer_factory_1.reducerFactory(a, m), replayState); }).pipe(operators_1.switchMap(function (scanReducer) {
            return _this.config.actionsSource$.pipe(scanReducer, operators_1.map(function (state) {
                return state instanceof Promise || state instanceof rxjs_1.Observable
                    ? rxjs_1.from(state)
                    : rxjs_1.of(state);
            }));
        }), operators_1.startWith(this.config.initialState$), operators_1.mergeMap(function (state) { return state; }), operators_1.takeUntil(this.config.onDestroy$), operators_1.shareReplay(1));
        this.state$.subscribe(this.replayStateSubject$);
    }
    return AsyncStore;
}());
exports.AsyncStore = AsyncStore;
