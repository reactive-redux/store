import { Store, mapA, mapNS, mapPS, filterPS, filterNS, filterA, reducePS, reduceNS, reduceA } from '../src/index';
import { ReducerFn } from '../src/interfaces';
import { MockState, MockInitValue, MockReducer, add, MockActionUnion } from './mock';
import { of, Subject } from 'rxjs';
import { skip } from 'rxjs/operators';
import { Middleware } from '../src/interfaces';

describe('Store', () => {
  let store: Store<MockState, typeof MockActionUnion.actions>;
  const actionStream$ = new Subject<typeof MockActionUnion.actions>();
  const destroy$ = new Subject<boolean>();
  const middleware$ = new Subject<Middleware<MockState, typeof MockActionUnion.actions>>();

  beforeEach(() => {
    store = new Store<MockState, typeof MockActionUnion.actions>({
      initialState$: of(MockInitValue),
      reducer$: of(MockReducer),
      actionStream$: actionStream$.asObservable(),
      middleware$: middleware$.asObservable(),
      destroy$,
    });
  });

  it('SHOULD be defined', () => {
    expect(store).toBeDefined();
  });

  it('SHOULD add middleware', done => {
    middleware$.next([
      mapA<MockState, typeof MockActionUnion.actions>(a => ({ ...a, payload: { number: 20 } })),
      mapNS<MockState, typeof MockActionUnion.actions>(s => ({ ...s, data: [...s.data, 10] })),
      mapPS<MockState, typeof MockActionUnion.actions>(s => ({ ...s, data: [...s.data, 5] })),
    ]);

    store.state$.pipe(skip(1)).subscribe(state => {
      expect(state.data.length).toBe(3);
      expect(state.data[0]).toBe(5); //mapping previous state
      expect(state.data[1]).toBe(20); //mapping action
      expect(state.data[2]).toBe(10); //mapping next state
      done();
    });

    actionStream$.next(add({ number: 5 }));
  });
});

describe('Middleware - mapPS (map previous state)', () => {
  it('should transform state before reducer runs', () => {
    const reducer: ReducerFn<{ count: number }, any> = (state, action) => ({
      count: state.count + (action.payload?.value || 0)
    });

    const middleware = mapPS<{ count: number }, any>(
      (state) => ({ count: state.count * 2 })
    )(reducer);

    const result = middleware({ count: 5 }, { type: 'ADD', payload: { value: 3 } });
    // State doubled to 10, then reducer adds 3 = 13
    expect(result.count).toBe(13);
  });
});

describe('Middleware - mapNS (map next state)', () => {
  it('should transform state after reducer runs', () => {
    const reducer: ReducerFn<{ count: number }, any> = (state, action) => ({
      count: state.count + (action.payload?.value || 0)
    });

    const middleware = mapNS<{ count: number }, any>(
      (state) => ({ count: state.count * 2 })
    )(reducer);

    const result = middleware({ count: 5 }, { type: 'ADD', payload: { value: 3 } });
    // Reducer produces 8, then state doubled = 16
    expect(result.count).toBe(16);
  });
});

describe('Middleware - mapA (map action)', () => {
  it('should transform action before reducer runs', () => {
    const reducer: ReducerFn<{ count: number }, any> = (state, action) => ({
      count: state.count + (action.payload?.value || 0)
    });

    const middleware = mapA<{ count: number }, any>(
      (action) => ({ ...action, payload: { value: (action.payload?.value || 0) * 10 } })
    )(reducer);

    const result = middleware({ count: 5 }, { type: 'ADD', payload: { value: 3 } });
    // Action transformed to 30, reducer adds 30 to state 5 = 35
    expect(result.count).toBe(35);
  });
});

describe('Middleware - filterPS (filter previous state)', () => {
  it('should skip reducer when filter returns false', () => {
    const reducer: ReducerFn<{ count: number }, any> = (state, action) => ({
      count: state.count + (action.payload?.value || 0)
    });

    const middleware = filterPS<{ count: number }, any>(
      (state) => state.count < 10
    )(reducer);

    const result = middleware({ count: 5 }, { type: 'ADD', payload: { value: 3 } });
    // State 5 < 10, so reducer runs = 8
    expect(result.count).toBe(8);

    const result2 = middleware({ count: 12 }, { type: 'ADD', payload: { value: 3 } });
    // State 12 >= 10, so reducer skipped, state unchanged
    expect(result2.count).toBe(12);
  });
});

describe('Middleware - filterNS (filter next state)', () => {
  it('should skip reducer output when filter returns false', () => {
    const reducer: ReducerFn<{ count: number }, any> = (state, action) => ({
      count: state.count + (action.payload?.value || 0)
    });

    const middleware = filterNS<{ count: number }, any>(
      (state) => state.count < 10
    )(reducer);

    const result = middleware({ count: 5 }, { type: 'ADD', payload: { value: 3 } });
    // Reducer produces 8, filter allows it (8 < 10) = 8
    expect(result.count).toBe(8);

    const result2 = middleware({ count: 8 }, { type: 'ADD', payload: { value: 3 } });
    // Reducer would produce 11, but filter blocks it (11 >= 10), returns original state 8
    expect(result2.count).toBe(8);
  });
});

describe('Middleware - filterA (filter action)', () => {
  it('should skip reducer when filter returns false', () => {
    const reducer: ReducerFn<{ count: number }, any> = (state, action) => ({
      count: state.count + (action.payload?.value || 0)
    });

    const middleware = filterA<{ count: number }, any>(
      (action) => action.type !== 'SKIP'
    )(reducer);

    const result = middleware({ count: 5 }, { type: 'ADD', payload: { value: 3 } });
    // Action not SKIP, reducer runs = 8
    expect(result.count).toBe(8);

    const result2 = middleware({ count: 5 }, { type: 'SKIP', payload: { value: 3 } });
    // Action is SKIP, reducer skipped, state unchanged = 5
    expect(result2.count).toBe(5);
  });
});

describe('Middleware - reducePS (reduce into previous state)', () => {
  it('should reduce state and action before passing to reducer', () => {
    const reducer: ReducerFn<{ count: number }, any> = (state, action) => ({
      count: state.count + action.extra
    });

    const middleware = reducePS<{ count: number }, any>(
      (state, action) => ({ count: state.count + action.payload.value })
    )(reducer);

    const result = middleware({ count: 5 }, { type: 'ADD', payload: { value: 3 }, extra: 0 });
    // reducePS: 5 + 3 = 8, then reducer adds extra (0) = 8
    expect(result.count).toBe(8);
  });
});

describe('Middleware - reduceNS (reduce into next state)', () => {
  it('should reduce state after reducer produces next state', () => {
    const reducer: ReducerFn<{ count: number }, any> = (state, action) => ({
      count: state.count + action.payload.value
    });

    const middleware = reduceNS<{ count: number }, any>(
      (state, _action) => ({ count: state.count + 10 })
    )(reducer);

    const result = middleware({ count: 5 }, { type: 'ADD', payload: { value: 3 } });
    // Reducer: 5 + 3 = 8, reduceNS: 8 + 10 = 18
    expect(result.count).toBe(18);
  });
});

describe('Middleware - reduceA (reduce into action)', () => {
  it('should reduce state and action into new action', () => {
    const reducer: ReducerFn<{ count: number }, any> = (state, action) => ({
      count: state.count + action.payload.value
    });

    const middleware = reduceA<{ count: number }, any>(
      (state, action) => ({ ...action, payload: { value: action.payload.value + state.count } })
    )(reducer);

    const result = middleware({ count: 5 }, { type: 'ADD', payload: { value: 3 } });
    // Action transformed: payload.value = 3 + 5 = 8, reducer: 5 + 8 = 13
    expect(result.count).toBe(13);
  });
});

describe('Middleware - chaining multiple middlewares', () => {
  it('should compose multiple middleware functions', () => {
    const reducer: ReducerFn<{ count: number }, any> = (state, action) => ({
      count: state.count + action.payload.value
    });

    const mw1 = mapPS<{ count: number }, any>((s) => ({ count: s.count + 1 }));
    const mw2 = mapA<{ count: number }, any>((a) => ({ ...a, payload: { value: a.payload.value * 2 } }));
    const mw3 = mapNS<{ count: number }, any>((s) => ({ count: s.count + 10 }));

    const composed = [mw1, mw2, mw3].reduce((f, g) => (r) => g(f(r)));

    const result = composed(reducer)({ count: 0 }, { type: 'ADD', payload: { value: 5 } });
    // mapPS: 0 + 1 = 1
    // reducer: 1 + (5 * 2) = 11
    // mapNS: 11 + 10 = 21
    expect(result.count).toBe(21);
  });
});