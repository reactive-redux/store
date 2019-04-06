import { TransducerMap, ActionMap, IAction } from './interfaces';
export declare function reducerFactory<State, ActionsUnion extends IAction>([actionMap, transducerMap, initialState]: [ActionMap<State, ActionsUnion>, TransducerMap<State, ActionsUnion>, State]): import("rxjs").OperatorFunction<ActionsUnion, State>;
