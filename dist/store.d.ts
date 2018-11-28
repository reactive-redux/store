import { Observable } from 'rxjs';
import { Action, ActionMap, MetaReducerMap } from './interfaces';
export declare class AsyncStore<State, ActionsUnion extends Action> {
    private config;
    private replayStateSubject$;
    state$: Observable<State>;
    constructor(config: {
        initialState$: Observable<State>;
        actionReducerMap$: Observable<ActionMap<ActionsUnion['type'], State>>;
        metaReducerMap$: Observable<MetaReducerMap<State>>;
        actionsSource$: Observable<ActionsUnion>;
        onDestroy$: Observable<boolean>;
    });
}
