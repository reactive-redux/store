import { ActionMap, MetaReducerMap, Action } from './interfaces';
export declare function reducerFactory<State, ActionsUnion extends Action, ActionsEnum extends string>(actionMap: ActionMap<State, ActionsUnion, ActionsEnum> & {
    [key: string]: any;
}, metaReducersMap: MetaReducerMap<State, ActionsUnion>): (state: State, action: ActionsUnion) => any;
