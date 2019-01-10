import { compose } from './utils';
import { ActionMap, MetaReducerMap, MetaReducerFn, Action } from './interfaces';

export function reducerFactory<ActionsUnion extends Action, State>(
  actionMap: ActionMap<ActionsUnion['type'], State>,
  metaReducersMap: MetaReducerMap<State>
) {
  const metaReducers = Object.keys(metaReducersMap).map(
    key => metaReducersMap[key]
  );
  const hasMeta = metaReducers.length > 0;

  return (state: State, action: ActionsUnion) => {
    if (!action.type || !actionMap[action.type]) return state;

    const reducerFn = actionMap[action.type] || (state => state);

    return hasMeta
      ? compose<MetaReducerFn<State>>(metaReducers)(reducerFn)(state, action)
      : reducerFn(state, action);
  };
}
