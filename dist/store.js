"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var reducer_factory_1 = require("./reducer.factory");
var utils_1 = require("./utils");
var AsyncStore = /** @class */ (function () {
    function AsyncStore(config) {
        var _this = this;
        this.config = config;
        this.replayStateSubject$ = new rxjs_1.ReplaySubject(1);
        this.state$ = rxjs_1.combineLatest(this.config.actionReducerMap$, this.config.metaReducerMap$).pipe(operators_1.switchMap(function (_a) {
            var _b = __read(_a, 2), a = _b[0], m = _b[1];
            return _this.replayStateSubject$.pipe(operators_1.take(1), operators_1.map(function (state) { return operators_1.scan(reducer_factory_1.reducerFactory(a, m), state); }));
        }), operators_1.switchMap(function (scanReducer) {
            return _this.config.actionsSource$.pipe(utils_1.mapToObservable, operators_1.concatMap(function (a) { return a.pipe(operators_1.catchError(function (e) { return rxjs_1.of(e); })); }), scanReducer, utils_1.mapToObservable);
        }), operators_1.startWith(this.config.initialState$), operators_1.mergeMap(function (state) {
            return state.pipe(operators_1.catchError(function (e) { return rxjs_1.of(e); }));
        }), operators_1.takeUntil(this.config.onDestroy$), operators_1.shareReplay(1));
        this.state$.subscribe(this.replayStateSubject$);
    }
    return AsyncStore;
}());
exports.AsyncStore = AsyncStore;
