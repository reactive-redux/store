import { Observable } from 'rxjs';
import { Action, ActionMap, MetaReducerMap } from './interfaces';
/**
 * State container based on RxJS observables
 *
 *
 *
 * @class AsyncStore<State, ActionsUnion>
 */
export declare class AsyncStore<State, ActionsUnion extends Action, ActionsEnum extends string> {
    private config;
    state$: Observable<State>;
    constructor(config: {
        initialState$: Observable<State>;
        actionMap$: Observable<ActionMap<State, ActionsUnion, ActionsEnum>>;
        metaMap$: Observable<MetaReducerMap<State, ActionsUnion>>;
        actionQ$: Observable<ActionsUnion | Promise<ActionsUnion> | Observable<ActionsUnion>>;
        onDestroy$: Observable<boolean>;
    });
}
