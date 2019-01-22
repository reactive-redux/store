import { ActionMap, MetaReducerMap, Action } from './interfaces';
export declare function reducerFactory<State, ActionsUnion extends Action>(actionMap: ActionMap<State, ActionsUnion> & {
    [key: string]: any;
}, metaReducersMap: MetaReducerMap<State, ActionsUnion>): (state: State, action: ActionsUnion) => any;
