"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ofType = ofType;
exports.createEffect = createEffect;
exports.createSubscriptionEffect = createSubscriptionEffect;
exports.createEpicRegistry = createEpicRegistry;
exports.createEffectRegistry = createEpicRegistry;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
/**
 * ofType filter - accepts action creators, extracts their `.type` for filtering
 * Usage: action$.pipe(ofType(actionCreator1, actionCreator2))
 */
function ofType(...actionCreators) {
    return (action$) => {
        return action$.pipe((0, operators_1.filter)((action) => actionCreators.some((creator) => creator.type === action.type)));
    };
}
/**
 * createEffect - factory pattern for creating effects
 * Usage: createEffect()(action$ => action$.pipe(ofType(...), switchMap(...)))
 * Usage with state: createEffect()((action$, state$) => action$.pipe(ofType(...), withLatestFrom(state$), ...))
 */
function createEffect(options = { dispatch: true }) {
    return (effectFactory) => {
        return (action$, state$) => {
            const mappedEffect$ = effectFactory(action$, state$);
            if (!options.dispatch) {
                return mappedEffect$.pipe((0, operators_1.ignoreElements)(), (0, operators_1.catchError)((error) => {
                    console.error('[Effect] Error:', error);
                    return (0, rxjs_1.of)();
                }));
            }
            return mappedEffect$.pipe((0, operators_1.catchError)((error) => {
                console.error('[Effect] Error:', error);
                return (0, rxjs_1.of)();
            }));
        };
    };
}
/**
 * createSubscriptionEffect - for subscription-style effects with auto-takeUntil
 * Usage: createSubscriptionEffect(destroy$)(action$ => action$.pipe(...))
 * Usage with state: createSubscriptionEffect(destroy$)((action$, state$) => ...)
 */
function createSubscriptionEffect(destroy$) {
    return (effectFactory) => {
        return (action$, state$) => {
            return effectFactory(action$, state$).pipe((0, operators_1.takeUntil)(destroy$), (0, operators_1.catchError)((error) => {
                console.error('[Effect] Error:', error);
                return (0, rxjs_1.of)();
            }));
        };
    };
}
/**
 * createEpicRegistry - combines multiple effects into a single epic
 * Usage: epic$ = createEpicRegistry(effect1, effect2, effect3)
 * Each effect may optionally receive state$ as a second argument.
 */
function createEpicRegistry(...effects) {
    return (action$, state$) => {
        return (0, rxjs_1.merge)(...effects.map((effect) => effect(action$, state$)));
    };
}
