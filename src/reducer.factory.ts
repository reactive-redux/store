import { _pipe, isValidAction } from './utils';
import { MetaReducerMap, ActionMap } from './interfaces';
import { Action } from './action';

export function reducerFactory<State, ActionsUnion extends Action>(
  actionMap: ActionMap<State>,
  metaReducerMap: MetaReducerMap<State>
) {
  const metaReducers = Object.keys(metaReducerMap).map(key => metaReducerMap[key]);
  const hasMeta = metaReducers.length > 0;
  const map = { ...actionMap };

  return function reducer(state: State, action: ActionsUnion) {
    if (!isValidAction(action, map)) return state;

    const actionReducer = map[action.type];

    return hasMeta
      ? _pipe(metaReducers)(actionReducer)(state, action)
      : actionReducer(state, action);
  };
}
