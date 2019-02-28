import { TransducerMap, ActionMap } from './interfaces';
import { Action } from './action';
export declare function reducerFactory<State, ActionsUnion extends Action>(actionMap: ActionMap<State>, transducerMap: TransducerMap<State>): (state: State, action: ActionsUnion) => any;
