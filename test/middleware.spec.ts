import { Store, mapA, mapNS, mapPS, filterA, filterNS, filterPS, reduceA, reduceNS, reducePS } from '../src/index';

import { MockState, MockInitValue, MockActionsEnum, MockReducer, add, remove, MockActionUnion } from './mock';
import { of, Subject } from 'rxjs';
import { skip } from 'rxjs/operators';
import { Middleware } from 'src/interfaces';

describe('Store', () => {
  let store: Store<MockState, typeof MockActionUnion.actions>;
  const actionStream$ = new Subject<typeof MockActionUnion.actions>();
  const destroy$ = new Subject<boolean>();
  const middleware$ = new Subject<Middleware<MockState, typeof MockActionUnion.actions>>();

  beforeEach(() => {
    store = new Store({
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
