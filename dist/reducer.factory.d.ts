import { MetaReducerMap, AsyncType } from './interfaces';
import { ActionMonad } from './action.monad';
export declare function reducerFactory<State, ActionsUnion extends ActionMonad<State>>(metaReducersMap: MetaReducerMap<State, ActionsUnion>): (state: AsyncType<State>, action: ActionsUnion) => any;
