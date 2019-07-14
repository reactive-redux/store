import { _pipe } from './utils';
import { scan } from 'rxjs/operators';
import { Reducer } from 'ts-action';

export function reducerFactory$<State>([
  initialState,
  reducer,
  transducers,
]: [State, Reducer<State>, any[]]) {
  function _reducer(state: State, action: any): State {
    return transducers.length > 0
      ? _pipe(transducers)(reducer)(state, action)
      : reducer(state, action);
  }

  return scan(_reducer, initialState);
}
