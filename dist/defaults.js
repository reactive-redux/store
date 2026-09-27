"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaults = getDefaults;
const rxjs_1 = require("rxjs");
const interfaces_1 = require("./interfaces");
const utils_1 = require("./utils");
const operators_1 = require("rxjs/operators");
const fop = {
    switchMap: operators_1.switchMap,
    mergeMap: operators_1.mergeMap,
    concatMap: operators_1.concatMap,
    exhaustMap: operators_1.exhaustMap,
};
function getDefaults(config = {}, options = {}, dispatchSubject) {
    var _a;
    const reducer$ = (config && config.reducer$ && config.reducer$.pipe(utils_1.catchErr)) ||
        (0, rxjs_1.of)((state, action) => state);
    const actions$ = new rxjs_1.Subject();
    const actionStream$ = reducer$ => (0, rxjs_1.merge)((config && config.actionStream$ && config.actionStream$.pipe(utils_1.catchErr)) || rxjs_1.EMPTY, dispatchSubject).pipe((0, operators_1.filter)(utils_1.isObject), (0, operators_1.map)(utils_1.mapToObservable), actionFlatten(utils_1.flatCatch), (0, operators_1.tap)(actions$), reducer$, (0, operators_1.map)(utils_1.mapToObservable));
    const initialState$ = ((config && config.initialState$ && config.initialState$.pipe(utils_1.catchErr)) ||
        (0, rxjs_1.of)({})).pipe((0, operators_1.share)());
    const middleware$ = (config && config.middleware$ && config.middleware$.pipe(utils_1.catchErr)) ||
        (0, rxjs_1.of)([]);
    const destroy$ = ((_a = config === null || config === void 0 ? void 0 : config.destroy$) === null || _a === void 0 ? void 0 : _a.pipe(utils_1.catchErr)) || rxjs_1.NEVER;
    const actionFlatten = fop[(options && options.actionFlatOp) || interfaces_1.FlattenOperator.concatMap];
    const stateFlatten = fop[(options && options.stateFlatOp) || interfaces_1.FlattenOperator.switchMap];
    const flattenState$ = (source) => source.pipe(stateFlatten(utils_1.flatCatch), (0, operators_1.map)(utils_1.mapToObservable), stateFlatten(utils_1.flatCatch));
    const bufferSize = (options && options.bufferSize) || 1;
    const windowTime = options && options.windowTime;
    const shareReplayConfig = {
        refCount: false,
        bufferSize,
        windowTime,
    };
    return {
        reducer$,
        actions$,
        actionStream$,
        initialState$,
        middleware$,
        destroy$,
        flattenState$,
        shareReplayConfig,
    };
}
