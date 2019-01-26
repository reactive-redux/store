import { Observable } from 'rxjs';
import { MetaReducerMap, FlattenOps, AsyncType } from './interfaces';
/**
 * State container based on RxJS observables
 *
 *
 *
 * @class AsyncStore<State, ActionsUnion>
 */
export declare class AsyncStore<State, ActionsUnion> {
    private config;
    private options?;
    state$: Observable<State>;
    private flattenOp;
    constructor(config: {
        initialState$: Observable<AsyncType<State>>;
        metaMap$: Observable<MetaReducerMap<State, ActionsUnion> | {}>;
        actionQ$: Observable<AsyncType<ActionsUnion>>;
        onDestroy$: Observable<boolean>;
    }, options?: {
        actionFop?: FlattenOps | undefined;
        stateFop?: FlattenOps | undefined;
    } | undefined);
}
