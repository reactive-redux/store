import { _pipe, isValidAction } from './utils';
import { TransducerMap, ActionMap } from './interfaces';
import { Action } from './action';

export function reducerFactory<State, ActionsUnion extends Action>(
  actionMap: ActionMap<State>,
  transducerMap: TransducerMap<State>
) {
  const transducers = Object.keys(transducerMap).map(key => transducerMap[key]);
  const hasT = transducers.length > 0;
  const _actionMap = { ...actionMap };

  return function reducer(state: State, action: ActionsUnion) {
    if (!isValidAction(action, _actionMap)) return state;

    const actionReducer = _actionMap[action.type];

    return hasT
      ? _pipe(transducers)(actionReducer)(state, action)
      : actionReducer(state, action);
  };
}
