import { _pipe } from './utils';
import { scan } from 'rxjs/operators';
import { Reducer } from 'ts-action';

export function reducerFactory$<State>([
  initialState,
  reducer,
  middleware,
]: [State, Reducer<State>, any[]]) {
  function _reducer(state: State, action: any): State {
    return middleware.length > 0
      ? _pipe(middleware)(reducer)(state, action)
      : reducer(state, action);
  }

  return scan(_reducer, initialState);
}
