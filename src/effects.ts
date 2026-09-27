import { merge, Observable, of, Subject } from 'rxjs';
import { catchError, filter, ignoreElements, takeUntil, tap } from 'rxjs/operators';

/**
 * Action creator interface - has a `type` property and is callable
 */
export interface ActionCreator<A = any> {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
export function ofType<A>(
  ...actionCreators: ActionCreator<A>[]
): (action$: Observable<A>) => Observable<A> {
  return (action$: Observable<A>): Observable<A> => {
    return action$.pipe(
      filter((action): action is A =>
        actionCreators.some((creator) => creator.type === (action as any).type),
      ),
    );
  };
}

export type EffectFactory<A, S = unknown> = (
  action$: Observable<A>,
  state$: Observable<S>,
) => Observable<A>;

/**
 * createEffect - factory pattern for creating effects
 * Usage: createEffect()(action$ => action$.pipe(ofType(...), switchMap(...)))
 * Usage with state: createEffect()((action$, state$) => action$.pipe(ofType(...), withLatestFrom(state$), ...))
 */
export function createEffect<A = any, S = unknown>(
  options: EffectOptions = { dispatch: true },
) {
  return (
    effectFactory: EffectFactory<A, S>,
  ): EffectFactory<A, S> => {
    return (action$: Observable<A>, state$: Observable<S>): Observable<A> => {
      const mappedEffect$: Observable<A> = effectFactory(action$, state$);

      if (!options.dispatch) {
        return mappedEffect$.pipe(
          ignoreElements(),
          catchError((error) => {
            console.error('[Effect] Error:', error);
            return of();
          }),
        );
      }

      return mappedEffect$.pipe(
        catchError((error) => {
          console.error('[Effect] Error:', error);
          return of();
        }),
      );
    };
  };
}

/**
 * createSubscriptionEffect - for subscription-style effects with auto-takeUntil
 * Usage: createSubscriptionEffect(destroy$)(action$ => action$.pipe(...))
 * Usage with state: createSubscriptionEffect(destroy$)((action$, state$) => ...)
 */
export function createSubscriptionEffect(destroy$: Subject<void>) {
  return <A, S = unknown>(
    effectFactory: EffectFactory<A, S>,
  ): EffectFactory<A, S> => {
    return (action$: Observable<A>, state$: Observable<S>): Observable<A> => {
      return effectFactory(action$, state$).pipe(
        takeUntil(destroy$),
        catchError((error) => {
          console.error('[Effect] Error:', error);
          return of();
        }),
      );
    };
  };
}

/**
 * EpicFn type - the function signature for an epic
 * Compatible with the epic$ option in createStore
 */
export type EpicFn<State, A> = (
  action$: Observable<A>,
  state$: Observable<State>,
) => Observable<A>;

/**
 * createEpicRegistry - combines multiple effects into a single epic
 * Usage: epic$ = createEpicRegistry(effect1, effect2, effect3)
 * Each effect may optionally receive state$ as a second argument.
 */
export function createEpicRegistry<State, A>(
  ...effects: Array<EffectFactory<A, State>>
): EpicFn<State, A> {
  return (action$, state$): Observable<A> => {
    return merge(...effects.map((effect) => effect(action$, state$)));
  };
}

/**
 * createEffectRegistry - alias for createEpicRegistry for semantic clarity
 * When using epic$ with createStore, effects are automatically wired together
 */
export { createEpicRegistry as createEffectRegistry };