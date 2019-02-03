import { MetaReducerMap, ActionMap } from './interfaces';
import { Action } from './action';
export declare function reducerFactory<State, ActionsUnion extends Action>(actionMap: ActionMap<State>, metaReducerMap: MetaReducerMap<State>): (state: State, action: ActionsUnion) => any;
