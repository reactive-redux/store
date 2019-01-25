import { ActionMap, MetaReducerMap, Action } from './interfaces';
import { ActionMonad } from './action.monad';
export declare function reducerFactory<State, ActionsUnion extends Action>(actionMap: ActionMap<State, ActionMonad<State>> & {
    [key: string]: any;
}, metaReducersMap: MetaReducerMap<State, ActionsUnion>): (state: State, action: ActionsUnion) => any;
