import { compose } from './utils';
import { ActionMap, MetaReducerMap, Action } from './interfaces';

export function reducerFactory<State, ActionsUnion extends Action>(
  actionMap: ActionMap<State, ActionsUnion> & {
    [key: string]: any; //cleanest way to fix: ..
  },
  metaReducersMap: MetaReducerMap<State, ActionsUnion>
) {
  const metaReducers = Object.keys(metaReducersMap).map(
    key => metaReducersMap[key]
  );
  const hasMeta = metaReducers.length > 0;

  return (state: State, action: ActionsUnion) => {
    if (!action.type || !actionMap[action.type]) return state;

    const reducerFn = actionMap[action.type];

    return hasMeta
      ? compose(metaReducers)(reducerFn)(state, action)
      : reducerFn(state, action);
  };
}
