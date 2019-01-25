import { compose } from './utils';
import { ActionMap, MetaReducerMap, Action } from './interfaces';
import { ActionMonad } from './action.monad';

export function reducerFactory<State, ActionsUnion extends Action>(
  actionMap: ActionMap<State, ActionMonad<State>> & {
    [key: string]: any; //cleanest way to fix: ..
  },
  metaReducersMap: MetaReducerMap<State, ActionsUnion>
) {
  const metaReducers = Object.keys(metaReducersMap).map(
    key => metaReducersMap[key]
  );
  const hasMeta = metaReducers.length > 0;

  const _actionMap = new Map<string, any>();

  Object.keys(actionMap)
    .map(k => [k, new actionMap[k]().runWith])
    .forEach(([key, value]) => _actionMap.set(key, value));

  return (state: State, action: ActionsUnion) => {
    if (!(action.type && _actionMap.has(action.type))) return state;

    const reducerFn =
      _actionMap.get(action.type) || ((state: State) => state);

    return hasMeta
      ? compose(metaReducers)(reducerFn)(state, action)
      : reducerFn(state, action);
  };
}
