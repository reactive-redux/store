import { Observable } from 'rxjs';
import { Action, StoreConfig } from './interfaces';
/**
 * State container based on RxJS observables
 *
 *
 *
 * @class AsyncStore<State, ActionUnion>
 */
export declare class AsyncStore<State, ActionsUnion extends Action> {
    private config;
    private replayStateSubject$;
    state$: Observable<State>;
    constructor(config: StoreConfig<State, ActionsUnion>);
}
