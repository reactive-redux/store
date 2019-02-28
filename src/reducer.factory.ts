import { _pipe, isValidAction } from './utils';
import { TransducerMap, ActionMap } from './interfaces';
import { Action } from './action';

export function reducerFactory<State, ActionsUnion extends Action>(
  actionMap: ActionMap<State>,
  transducerMap: TransducerMap<State>
) {
  const transducers = Object.keys(transducerMap).map(key => transducerMap[key]);
  const hasT = transducers.length > 0;
  const map = { ...actionMap };

  return function reducer(state: State, action: ActionsUnion) {
    if (!isValidAction(action, map)) return state;

    const actionReducer = map[action.type];

    return hasT
      ? _pipe(transducers)(actionReducer)(state, action)
      : actionReducer(state, action);
  };
}
