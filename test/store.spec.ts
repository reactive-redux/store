import { Store } from '../src/index';
import {
  MockState,
  mockInitValue,
} from './mock';
import { take } from 'rxjs/operators';
import { createStore } from '../src/store';

describe('Store', () => {
  let store: Store<any, any>;

  beforeEach(() => {
    store = new Store();
  });

  it('SHOULD be defined', () => {
    expect(store).toBeDefined();
  });

  it('SHOULD have initial value', (done) => {
    const s = {};
    store.state$.pipe(take(1)).subscribe(data => {
      expect(data).toBeDefined();
      expect(data).toEqual(s);
      done();
    });
  });
});

