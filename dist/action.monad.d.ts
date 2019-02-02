import { Action } from './interfaces';
export declare abstract class ActionMonad<State> implements Action {
    payload?: unknown;
    readonly type: string;
    constructor(payload?: unknown);
    abstract runWith(state: State): State;
}
