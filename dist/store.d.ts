import { Observable } from 'rxjs';
import { Action, ActionMap, MetaReducerMap, FlattenOps } from './interfaces';
/**
 * State container based on RxJS observables
 *
 *
 *
 * @class AsyncStore<State, ActionsUnion>
 */
export declare class AsyncStore<State, ActionsUnion extends Action> {
    private config;
    private options?;
    state$: Observable<State>;
    private flattenOp;
    constructor(config: {
        initialState$: Observable<State>;
        actionMap$: Observable<ActionMap<State, ActionsUnion>>;
        metaMap$: Observable<MetaReducerMap<State, ActionsUnion>>;
        actionQ$: Observable<ActionsUnion | Promise<ActionsUnion> | Observable<ActionsUnion>>;
        onDestroy$: Observable<boolean>;
    }, options?: {
        actionFop?: FlattenOps | undefined;
        stateFop?: FlattenOps | undefined;
    } | undefined);
}
