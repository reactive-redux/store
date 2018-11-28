import { ActionMap, MetaReducerMap, Action } from './interfaces';
export declare function reducerFactory<ActionsUnion extends Action, State>(actionMap: ActionMap<ActionsUnion['type'], State>, metaReducersMap: MetaReducerMap<State>): (state: State, action: ActionsUnion) => State;
