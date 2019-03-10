import { Store, ofType } from '../src/index';
import {
  MockState,
  mockInitValue,
  mockReducerMap,
  MockActionsUnion,
  MockAdd
} from './mock';
import { take } from 'rxjs/operators';

describe('Store', () => {
  let store: Store<any, any>;

  beforeEach(() => {
    store = new Store();
  });

  it('SHOULD be defined', () => {
    expect(store).toBeDefined();
  });

  it('SHOULD have initial value', done => {
    const s = {};
    store.state$.pipe(take(1)).subscribe(data => {
      expect(data).toBeDefined();
      expect(data).toEqual({});
      done();
    });
  });
});

