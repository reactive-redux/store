import { Action, AsyncType } from './interfaces';
export declare abstract class ActionMonad<State> implements Action {
    payload?: unknown;
    readonly type: string;
    constructor(payload?: unknown);
    abstract runWith(state: AsyncType<State>): AsyncType<State>;
}
