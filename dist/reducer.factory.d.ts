import { Transducers, ActionMap, IAction } from './interfaces';
export declare function reducerFactory$<State, ActionsUnion extends IAction>([actionMap, transducers, initialState]: [ActionMap<State, ActionsUnion>, Transducers<State, ActionsUnion>, State]): import("rxjs").OperatorFunction<ActionsUnion, State>;
