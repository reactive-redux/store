import { Observable, Subject } from 'rxjs';
/**
 * Action creator interface - has a `type` property and is callable
 */
export interface ActionCreator<A = any> {
    type: string;
    (payload?: any): A;
}
/**
 * Options for createEffect
 */
export interface EffectOptions {
    dispatch?: boolean;
}
/**
 * ofType filter - accepts action creators, extracts their `.type` for filtering
 * Usage: action$.pipe(ofType(actionCreator1, actionCreator2))
 */
export declare function ofType<A>(...actionCreators: ActionCreator<A>[]): (action$: Observable<A>) => Observable<A>;
export type EffectFactory<A, S = unknown> = (action$: Observable<A>, state$: Observable<S>) => Observable<A>;
/**
 * createEffect - factory pattern for creating effects
 * Usage: createEffect()(action$ => action$.pipe(ofType(...), switchMap(...)))
 * Usage with state: createEffect()((action$, state$) => action$.pipe(ofType(...), withLatestFrom(state$), ...))
 */
export declare function createEffect<A = any, S = unknown>(options?: EffectOptions): (effectFactory: EffectFactory<A, S>) => EffectFactory<A, S>;
/**
 * createSubscriptionEffect - for subscription-style effects with auto-takeUntil
 * Usage: createSubscriptionEffect(destroy$)(action$ => action$.pipe(...))
 * Usage with state: createSubscriptionEffect(destroy$)((action$, state$) => ...)
 */
export declare function createSubscriptionEffect(destroy$: Subject<void>): <A, S = unknown>(effectFactory: EffectFactory<A, S>) => EffectFactory<A, S>;
/**
 * EpicFn type - the function signature for an epic
 * Compatible with the epic$ option in createStore
 */
export type EpicFn<State, A> = (action$: Observable<A>, state$: Observable<State>) => Observable<A>;
/**
 * createEpicRegistry - combines multiple effects into a single epic
 * Usage: epic$ = createEpicRegistry(effect1, effect2, effect3)
 * Each effect may optionally receive state$ as a second argument.
 */
export declare function createEpicRegistry<State, A>(...effects: Array<EffectFactory<A, State>>): EpicFn<State, A>;
/**
 * createEffectRegistry - alias for createEpicRegistry for semantic clarity
 * When using epic$ with createStore, effects are automatically wired together
 */
export { createEpicRegistry as createEffectRegistry };
