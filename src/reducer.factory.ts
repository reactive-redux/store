import { _pipe } from './utils';
import { MetaReducerMap, ActionMap } from './interfaces';
import { Action } from './action';

export function reducerFactory<State, ActionsUnion extends Action>(
  actionMap: ActionMap<State>,
  metaReducerMap: MetaReducerMap<State>
) {
  const metaReducers = Object.keys(metaReducerMap).map(key => metaReducerMap[key]);
  const hasMeta = metaReducers.length > 0;

  return function reducer(state: State, action: ActionsUnion) {
    if (
      !(
        action.type &&
        typeof action.type === 'string' &&
        !!actionMap[action.type] &&
        typeof actionMap[action.type] === 'function'
      )
    )
      return state;

    const next = actionMap[action.type];

    return hasMeta ? _pipe(metaReducers)(next)(state, action) : next(state, action);
  };
}
