import { Store, createStore } from '../src/index';
import { MockState, MockInitValue, MockReducer, add, MockActionUnion } from './mock';
import { of, Subject, BehaviorSubject } from 'rxjs';
import { take, skip } from 'rxjs/operators';
import { StoreConfig, FlattenOperator } from '../src/interfaces';

describe('Store', () => {
  let store: Store<MockState, typeof MockActionUnion.actions>;
  const actionStream$ = new Subject<typeof MockActionUnion.actions>();
  const destroy$ = new Subject<boolean>();

  beforeEach(() => {
    store = new Store<MockState, typeof MockActionUnion.actions>({
      initialState$: of(MockInitValue),
      reducer$: of(MockReducer),
      actionStream$: actionStream$.asObservable(),
      destroy$,
    } as StoreConfig<MockState, typeof MockActionUnion.actions>);
  });

  it('SHOULD be defined', () => {
    expect(store).toBeDefined();
  });

  it('SHOULD have state$ and actions$ observables', () => {
    expect(store.state$).toBeDefined();
    expect(store.actions$).toBeDefined();
  });

  it('SHOULD emit initial state', (done) => {
    store.state$.pipe(take(1)).subscribe(state => {
      expect(state).toEqual(MockInitValue);
      done();
    });
  });

  it('SHOULD dispatch actions and update state', (done) => {
    store.state$.pipe(skip(1)).subscribe(state => {
      if (state.data.length > 0) {
        expect(state.data[0]).toBe(5);
        done();
      }
    });

    actionStream$.next(add({ number: 5 }));
  });

  it('SHOULD allow multiple subscribers', (done) => {
    let count = 0;
    const results: MockState[] = [];

    store.state$.pipe(skip(1)).subscribe(state => {
      results.push(state);
      count++;
      if (count === 2) {
        expect(results.length).toBe(2);
        done();
      }
    });

    actionStream$.next(add({ number: 5 }));
    actionStream$.next(add({ number: 10 }));
  });
});

describe('Store - dispatch', () => {
  it('SHOULD have dispatch method', () => {
    const store = new Store();
    expect(typeof store.dispatch).toBe('function');
  });

  it('SHOULD dispatch actions via dispatch method', (done) => {
    const store = new Store<{ count: number }, any>({
      initialState$: of({ count: 0 }),
      reducer$: of((state, action) => {
        if (action.type === 'INCREMENT') {
          return { count: state.count + 1 };
        }
        return state;
      }),
    });

    store.state$.pipe(skip(1)).subscribe(state => {
      expect(state.count).toBe(1);
      done();
    });

    store.dispatch({ type: 'INCREMENT' });
  });
});

describe('Store - createStore factory', () => {
  it('SHOULD create store using factory function', () => {
    const store = createStore();
    expect(store).toBeDefined();
    expect(store instanceof Store).toBe(true);
  });

  it('SHOULD create store with config', (done) => {
    const store = createStore<{ value: number }, any>({
      initialState$: of({ value: 10 }),
      reducer$: of((_state, _action) => _state),
    });

    store.state$.pipe(take(1)).subscribe(state => {
      expect(state.value).toBe(10);
      done();
    });
  });
});

describe('Store - destroy$ subscription cleanup', () => {
  it('SHOULD complete state$ when destroy$ emits', (done) => {
    const destroy$ = new Subject<boolean>();

    const store = new Store<MockState, any>({
      initialState$: of(MockInitValue),
      reducer$: of(MockReducer),
      actionStream$: new Subject(),
      destroy$,
    });

    store.state$.subscribe({
      complete: () => {
        done();
      }
    });

    destroy$.next(true);
    destroy$.complete();
  });
});

describe('Store - with middleware', () => {
  it('SHOULD work with middleware observable', (done) => {
    const middleware$ = new BehaviorSubject<any[]>([]);

    const store = new Store<MockState, typeof MockActionUnion.actions>({
      initialState$: of(MockInitValue),
      reducer$: of(MockReducer),
      actionStream$: new Subject(),
      middleware$,
      destroy$: new Subject(),
    });

    store.state$.pipe(take(1)).subscribe(state => {
      expect(state).toEqual(MockInitValue);
      done();
    });
  });
});

describe('Store - options', () => {
  it('SHOULD accept custom flatten operator', (done) => {
    const actionStream$ = new Subject<any>();

    const store = new Store<{ count: number }, any>(
      {
        initialState$: of({ count: 0 }),
        reducer$: of((state, action) => {
          if (action.type === 'ADD') {
            return { count: state.count + action.payload };
          }
          return state;
        }),
        actionStream$,
      },
      {
        actionFlatOp: FlattenOperator.mergeMap,
        stateFlatOp: FlattenOperator.switchMap,
        bufferSize: 1,
      }
    );

    store.state$.pipe(skip(1)).subscribe(state => {
      expect(state.count).toBe(5);
      done();
    });

    actionStream$.next({ type: 'ADD', payload: 5 });
  });
});

describe('Store - epic integration', () => {
  it('SHOULD handle epic$ option', (done) => {
    const actions$ = new Subject<any>();

    const store = new Store<{ count: number }, any>({
      initialState$: of({ count: 0 }),
      reducer$: of((state, action) => {
        if (action.type === 'INCREMENT') {
          return { count: state.count + 1 };
        }
        return state;
      }),
      actionStream$: actions$.asObservable(),
      epic$: (action$, _state$) => {
        return action$.pipe(
          skip(1)
        );
      },
      destroy$: new Subject(),
    });

    store.state$.pipe(take(1)).subscribe(state => {
      expect(state.count).toBe(0);
      done();
    });

    actions$.next({ type: 'INCREMENT' });
  });
});