import { compose } from './utils';
import { MetaReducerMap } from './interfaces';
import { ActionMonad } from './action.monad';

export function reducerFactory<
  State,
  ActionsUnion extends ActionMonad<State>
>(metaReducerMap: MetaReducerMap<State>) {
  const metaReducers = Object.keys(metaReducerMap).map(
    key => metaReducerMap[key]
  );
  const hasMeta = metaReducers.length > 0;

  return (state: State, action: ActionsUnion) => {
    if (
      !(
        action.type &&
        action.runWith &&
        typeof action.runWith === 'function'
      )
    )
      return state;

    return hasMeta
      ? compose(metaReducers)(action.runWith)(state)
      : action.runWith(state);
  };
}
