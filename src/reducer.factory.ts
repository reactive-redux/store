import { compose } from './utils';
import { MetaReducerMap, AsyncType } from './interfaces';
import { ActionMonad } from './action.monad';

export function reducerFactory<
  State,
  ActionsUnion extends ActionMonad<State>
>(metaReducersMap: MetaReducerMap<State, ActionsUnion>) {
  const metaReducers = Object.keys(metaReducersMap).map(
    key => metaReducersMap[key]
  );
  const hasMeta = metaReducers.length > 0;

  return (state: AsyncType<State>, action: ActionsUnion) => {
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
