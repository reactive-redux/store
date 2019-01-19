import { compose } from './utils';
import {
  ActionMap,
  MetaReducerMap,
  MetaReducerFn,
  Action
} from './interfaces';

export function reducerFactory<
  State,
  ActionsUnion extends Action,
  ActionsEnum extends string
>(
  actionMap: ActionMap<State, ActionsUnion, ActionsEnum> & {
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

    const reducerFn =
      actionMap[action.type] || ((state: any) => state);

    return hasMeta
      ? compose<MetaReducerFn<State, ActionsUnion>>(metaReducers)(
          reducerFn
        )(state, action)
      : reducerFn(state, action);
  };
}
