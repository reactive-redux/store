import { _pipe, isValidAction } from './utils';
import { Transducers, ActionMap, IAction } from './interfaces';
import { scan } from 'rxjs/operators';

export function reducerFactory$<State, ActionsUnion extends IAction>([
  actionMap,
  transducers,
  initialState
]: [ActionMap<State, ActionsUnion>, Transducers<State, ActionsUnion>, State]) {
  function reducer(state: State, action: ActionsUnion): State {
    if (!isValidAction(action, actionMap)) return state;

    const actionReducer = actionMap[action.type];

    return transducers.length > 0
      ? _pipe(transducers)(actionReducer)(state, action)
      : actionReducer(state, action);
  }

  return scan(reducer, initialState);
}
