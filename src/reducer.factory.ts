import { scan } from 'rxjs/operators';
import { compose } from './utils';
import { MiddlewareFn, ReducerFn } from './interfaces';
import { Action } from 'ts-action';

export function reducerFactory$<State>([
  initialState,
  reducer,
  middleware,
]: [State, ReducerFn<State, any>, MiddlewareFn<State, any>[]]) {
  function _reducer(state: State, action: Action): State {
    return middleware.length > 0
      ? compose(middleware)(reducer)(state, action)
      : reducer(state, action);
  }

  return scan(_reducer, initialState);
}
