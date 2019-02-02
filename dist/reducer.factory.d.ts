import { MetaReducerMap } from './interfaces';
import { ActionMonad } from './action.monad';
export declare function reducerFactory<State, ActionsUnion extends ActionMonad<State>>(metaReducerMap: MetaReducerMap<State>): (state: State, action: ActionsUnion) => any;
