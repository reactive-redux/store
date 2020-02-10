import { compose } from './utils';
import { scan } from 'rxjs/operators';
import { Reducer, Action } from 'ts-action';
import { MiddlewareFn } from 'src/interfaces';

export function reducerFactory$<State>([
  initialState,
  reducer,
  middleware,
]: [State, Reducer<State>, MiddlewareFn<State, any>[]]) {
  function _reducer(state: State, action: Action): State {
    return middleware.length > 0
      ? compose(middleware)(reducer)(state, action)
      : reducer(state, action);
  }

  return scan(_reducer, initialState);
}
