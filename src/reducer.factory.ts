import { compose } from './utils';
import { scan } from 'rxjs/operators';
import { MiddlewareFn, ReducerFn, IAction } from 'src/interfaces';

export function reducerFactory$<State>([
  initialState,
  reducer,
  middleware,
]: [State, ReducerFn<State, any>, MiddlewareFn<State, any>[]]) {
  function _reducer(state: State, action: IAction): State {
    return middleware.length > 0
      ? compose(middleware)(reducer)(state, action)
      : reducer(state, action);
  }

  return scan(_reducer, initialState);
}
