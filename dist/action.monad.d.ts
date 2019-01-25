import { Action } from './interfaces';
import { Observable } from 'rxjs';
export declare abstract class ActionMonad<State> implements Action {
    payload?: unknown;
    readonly type: string;
    constructor(payload?: unknown);
    abstract runWith(state: State | Promise<State> | Observable<State>, action: unknown): State | Promise<State> | Observable<State>;
}
