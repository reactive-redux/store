import { of, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { createStore } from '../src/index';
import {
  connectReduxDevTools,
  normalizeDevToolsConfig,
  withDevToolsTimeTravel,
} from '../src/devtools';

interface State {
  count: number;
  history: string[];
}

type TestAction =
  | { type: 'INC' }
  | { type: 'SET'; payload: number };

const initialState: State = { count: 0, history: [] };

const reducerFn = (state: State, action: TestAction): State => {
  switch (action.type) {
    case 'INC':
      return {
        ...state,
        count: state.count + 1,
        history: [...state.history, 'INC'],
      };
    case 'SET':
      return { ...state, count: action.payload };
    default:
      return state;
  }
};

interface DevToolsMessage {
  type: string;
  payload?: { type: string };
  state?: string;
}

describe('DevTools bridge', () => {
  let sent: { action: { type: string }; state: State }[];
  let inited: unknown[];
  let connectOptions: Record<string, unknown> | undefined;
  let messageListener: ((message: DevToolsMessage) => void) | undefined;
  let messagesUnsubscribed: boolean;

  const installFakeExtension = () => {
    (globalThis as any).__REDUX_DEVTOOLS_EXTENSION__ = {
      connect: (options?: Record<string, unknown>) => {
        connectOptions = options;
        return {
          init: (state: unknown) => inited.push(state),
          send: (action: { type: string }, state: State) =>
            sent.push({ action, state }),
          subscribe: (listener: (message: DevToolsMessage) => void) => {
            messageListener = listener;
            return () => {
              messagesUnsubscribed = true;
              messageListener = undefined;
            };
          },
          unsubscribe: () => undefined,
        };
      },
    };
  };

  const latestState = (store: { state$: any }): State => {
    let current: State | undefined;
    store.state$.pipe(take(1)).subscribe((s: State) => (current = s));
    return current as State;
  };

  beforeEach(() => {
    sent = [];
    inited = [];
    connectOptions = undefined;
    messageListener = undefined;
    messagesUnsubscribed = false;
    installFakeExtension();
  });

  afterEach(() => {
    delete (globalThis as any).__REDUX_DEVTOOLS_EXTENSION__;
  });

  const makeStore = (
    devTools: any = { name: 'TestStore' },
    destroy$?: Subject<void>
  ) =>
    createStore<State, TestAction>({
      reducer$: of(reducerFn),
      initialState$: of(initialState),
      devTools,
      ...(destroy$ ? { destroy$ } : {}),
    });

  it('SHOULD init with the initial state on connect', () => {
    makeStore();
    expect(inited).toEqual([initialState]);
  });

  it('SHOULD send exactly one (action, state) pair per dispatched action', () => {
    const store = makeStore();
    store.dispatch({ type: 'INC' });
    store.dispatch({ type: 'INC' });
    expect(sent.length).toBe(2);
  });

  it('SHOULD pair each action with the state it produced', () => {
    const store = makeStore();
    store.dispatch({ type: 'INC' });
    store.dispatch({ type: 'SET', payload: 42 });

    expect(sent[0].action.type).toBe('INC');
    expect(sent[0].state.count).toBe(1);
    expect(sent[1].action.type).toBe('SET');
    expect(sent[1].state.count).toBe(42);
  });

  it('SHOULD apply JUMP_TO_ACTION messages to the store state', () => {
    const store = makeStore();
    store.dispatch({ type: 'INC' });
    store.dispatch({ type: 'INC' });

    const jumpTarget: State = { count: 1, history: ['INC'] };
    messageListener!({
      type: 'DISPATCH',
      payload: { type: 'JUMP_TO_ACTION' },
      state: JSON.stringify(jumpTarget),
    });

    expect(latestState(store)).toEqual(jumpTarget);
  });

  it('SHOULD NOT echo the jump action back to the extension', () => {
    const store = makeStore();
    store.dispatch({ type: 'INC' });

    messageListener!({
      type: 'DISPATCH',
      payload: { type: 'JUMP_TO_STATE' },
      state: JSON.stringify(initialState),
    });

    expect(sent.length).toBe(1);
  });

  it('SHOULD continue reducing from the jumped state', () => {
    const store = makeStore();
    store.dispatch({ type: 'INC' });
    store.dispatch({ type: 'INC' });

    messageListener!({
      type: 'DISPATCH',
      payload: { type: 'JUMP_TO_ACTION' },
      state: JSON.stringify({ count: 1, history: ['INC'] }),
    });
    store.dispatch({ type: 'INC' });

    expect(latestState(store).count).toBe(2);
    expect(sent[sent.length - 1].state.count).toBe(2);
  });

  it('SHOULD re-init with the current state on COMMIT', () => {
    const store = makeStore();
    store.dispatch({ type: 'INC' });

    messageListener!({ type: 'DISPATCH', payload: { type: 'COMMIT' } });

    expect(inited.length).toBe(2);
    expect((inited[1] as State).count).toBe(1);
  });

  it('SHOULD pass name/maxAge/extensionOptions through to extension.connect', () => {
    makeStore({
      name: 'Custom',
      maxAge: 100,
      extensionOptions: { trace: true },
    });
    expect(connectOptions).toEqual({ name: 'Custom', maxAge: 100, trace: true });
  });

  it('SHOULD use defaults with devTools: true', () => {
    makeStore(true);
    expect(connectOptions).toEqual({ name: 'RxDI Store', maxAge: 50 });
  });

  it('SHOULD be a no-op when the extension is absent', () => {
    delete (globalThis as any).__REDUX_DEVTOOLS_EXTENSION__;
    const store = makeStore();
    store.dispatch({ type: 'INC' });

    expect(inited.length).toBe(0);
    expect(sent.length).toBe(0);
    expect(latestState(store).count).toBe(1);
  });

  it('SHOULD be a no-op when devTools is false', () => {
    const store = makeStore(false);
    store.dispatch({ type: 'INC' });
    expect(inited.length).toBe(0);
    expect(sent.length).toBe(0);
  });

  it('SHOULD be a no-op when enabled === false even with the extension present', () => {
    const store = makeStore({ name: 'Disabled', enabled: false });
    store.dispatch({ type: 'INC' });
    expect(inited.length).toBe(0);
    expect(sent.length).toBe(0);
  });

  it('SHOULD disconnect on destroy$', () => {
    const destroy$ = new Subject<void>();
    const store = makeStore({ name: 'TestStore' }, destroy$);
    store.dispatch({ type: 'INC' });
    expect(sent.length).toBe(1);

    destroy$.next();
    store.dispatch({ type: 'INC' });

    expect(sent.length).toBe(1);
    expect(messagesUnsubscribed).toBe(true);
  });

  it('SHOULD return a working teardown function from standalone connectReduxDevTools', () => {
    const store = createStore<State, TestAction>({
      reducer$: of(withDevToolsTimeTravel(reducerFn)),
      initialState$: of(initialState),
    });
    const teardown = connectReduxDevTools(store, { name: 'Standalone' });

    store.dispatch({ type: 'INC' });
    expect(sent.length).toBe(1);

    teardown();
    store.dispatch({ type: 'INC' });
    expect(sent.length).toBe(1);
    expect(messagesUnsubscribed).toBe(true);
  });

  it('SHOULD normalize the devTools config union', () => {
    expect(normalizeDevToolsConfig(undefined)).toBeUndefined();
    expect(normalizeDevToolsConfig(false)).toBeUndefined();
    expect(normalizeDevToolsConfig(true)).toEqual({});
    expect(normalizeDevToolsConfig({ name: 'X' })).toEqual({ name: 'X' });
    expect(
      normalizeDevToolsConfig({ name: 'X', enabled: false })
    ).toBeUndefined();
  });
});
