import { _pipe } from './utils';
import { MetaReducerMap, ActionMap } from './interfaces';
import { Action } from './action';

export function reducerFactory<State, ActionsUnion extends Action>(
  actionMap: ActionMap<State>,
  metaReducerMap: MetaReducerMap<State>
) {
  const metaReducers = Object.keys(metaReducerMap).map(key => metaReducerMap[key]);
  const hasMeta = metaReducers.length > 0;

  return (state: State, action: ActionsUnion) => {
    if (
      !(
        action.type &&
        typeof action.type === 'string' &&
        !!actionMap[action.type] &&
        typeof actionMap[action.type] === 'function'
      )
    )
      return state;

    const reducer = actionMap[action.type];

    return hasMeta
      ? _pipe(metaReducers)(reducer)(state, action)
      : reducer(state, action);
  };
}
