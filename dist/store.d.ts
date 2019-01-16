import { Observable } from 'rxjs';
import { Action, ActionMap, MetaReducerMap } from './interfaces';
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
    constructor(config: {
        initialState$: Observable<State>;
        actionMap$: Observable<ActionMap<ActionsUnion['type'], State>>;
        metaMap$: Observable<MetaReducerMap<State>>;
        actionQ$: Observable<ActionsUnion | Promise<ActionsUnion> | Observable<ActionsUnion>>;
        onDestroy$: Observable<boolean>;
    });
}
