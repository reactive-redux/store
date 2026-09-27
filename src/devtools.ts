import { Observable, Subscription } from 'rxjs';
import { filter, withLatestFrom } from 'rxjs/operators';

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
export const DEVTOOLS_JUMP_TO_STATE = '@@redux-devtools/JUMP_TO_STATE';

interface AnyAction {
  type: string;
}

interface JumpToStateAction extends AnyAction {
  state: unknown;
}

interface DevToolsMessage {
  type: string;
  payload?: { type: string };
  /** JSON-encoded state, present on time-travel messages. */
  state?: string;
}

interface DevToolsConnection {
  init(state: unknown): void;
  send(action: AnyAction, state: unknown): void;
  subscribe(listener: (message: DevToolsMessage) => void): (() => void) | void;
  unsubscribe?(): void;
}

interface DevToolsExtension {
  connect(options?: Record<string, unknown>): DevToolsConnection;
}

export interface DevToolsOptions {
  /** Instance name shown in the DevTools instance selector (default 'RxDI Store'). */
  name?: string;
  /** Maximum number of actions kept in the DevTools history (default 50). */
  maxAge?: number;
  /** Runtime toggle inside an options object. Default true. */
  enabled?: boolean;
  /**
   * Extra options forwarded verbatim to extension.connect() —
   * actionSanitizer, stateSanitizer, serialize, trace, features, ...
   */
  extensionOptions?: Record<string, unknown>;
}

/**
 * The StoreConfig form of the option: a bare boolean toggle, or full options.
 *
 *   devTools: true                          // on, default name
 *   devTools: DEBUG && { name: 'MyStore' }  // toggle + options in one expression
 */
export type DevToolsConfig = boolean | DevToolsOptions;

/** Resolve the toggle union to options-or-off. */
export function normalizeDevToolsConfig(
  config?: DevToolsConfig
): DevToolsOptions | undefined {
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
export function withDevToolsTimeTravel<State, A>(
  reducerFn: (state: State, action: A) => State
): (state: State, action: A) => State {
  return (state, action) =>
    (action as unknown as AnyAction)?.type === DEVTOOLS_JUMP_TO_STATE
      ? ((action as unknown as JumpToStateAction).state as State)
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
export function connectReduxDevTools<State, A>(
  store: {
    state$: Observable<State>;
    actions$: Observable<A>;
    dispatch: (action: A) => void;
  },
  options: DevToolsOptions = {}
): () => void {
  const extension = (
    globalThis as { __REDUX_DEVTOOLS_EXTENSION__?: DevToolsExtension }
  ).__REDUX_DEVTOOLS_EXTENSION__;

  if (options.enabled === false || !extension) {
    return () => undefined;
  }

  const devTools = extension.connect({
    name: options.name ?? 'RxDI Store',
    maxAge: options.maxAge ?? 50,
    ...options.extensionOptions,
  });

  const subscription = new Subscription();

  // state$ replays its latest value synchronously on subscribe, so
  // currentState is populated before init() below.
  let currentState: State | undefined;
  subscription.add(
    store.state$.subscribe(state => {
      currentState = state;
    })
  );
  devTools.init(currentState);

  subscription.add(
    store.state$
      .pipe(
        withLatestFrom(store.actions$),
        // Jumps come from the DevTools UI — echoing them back would
        // pollute the action log.
        filter(
          ([, action]) =>
            (action as unknown as AnyAction).type !== DEVTOOLS_JUMP_TO_STATE
        )
      )
      .subscribe(([state, action]) =>
        devTools.send(action as unknown as AnyAction, state)
      )
  );

  const unsubscribeMessages = devTools.subscribe(message => {
    if (message.type !== 'DISPATCH') {
      return;
    }
    const kind = message.payload?.type;
    if (
      (kind === 'JUMP_TO_ACTION' || kind === 'JUMP_TO_STATE') &&
      message.state
    ) {
      store.dispatch({
        type: DEVTOOLS_JUMP_TO_STATE,
        state: JSON.parse(message.state),
      } as unknown as A);
    } else if (kind === 'COMMIT') {
      devTools.init(currentState);
    }
  });

  return () => {
    subscription.unsubscribe();
    if (typeof unsubscribeMessages === 'function') {
      unsubscribeMessages();
    }
    devTools.unsubscribe?.();
  };
}
