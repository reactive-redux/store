import { _pipe, isValidAction } from './utils';
import { TransducerMap, ActionMap, IAction } from './interfaces';
import { scan } from 'rxjs/operators';

export function reducerFactory<State, ActionsUnion extends IAction>([
  actionMap,
  transducerMap,
  initialState
]: [ActionMap<State, ActionsUnion>, TransducerMap<State, ActionsUnion>, State]) {
  const transducers = Object.keys(transducerMap).map(key => transducerMap[key]);
  const hasT = transducers.length > 0;
  const _actionMap = { ...actionMap };
  const reducer = (state: State, action: ActionsUnion): State => {
    if (!isValidAction(action, _actionMap)) return state;

    const actionReducer = _actionMap[action.type];

    return hasT
      ? _pipe(transducers)(actionReducer)(state, action)
      : actionReducer(state, action);
  };

  return scan(reducer, initialState);
}
