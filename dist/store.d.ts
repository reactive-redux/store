import { Observable } from 'rxjs';
import { MetaReducerMap, FlattenOps, AsyncType } from './interfaces';
/**
 * State container based on RxJS observables
 *
 *
 *
 * @class AsyncStore<State, ActionsUnion>
 */
export declare class AsyncStore<State, ActionsUnion = any> {
    private config?;
    private options?;
    state$: Observable<State>;
    private flattenOp;
    constructor(config?: {
        actions$?: Observable<AsyncType<ActionsUnion>> | undefined;
        initialState$?: Observable<AsyncType<State>> | undefined;
        metaReducers$?: Observable<MetaReducerMap<State>> | undefined;
        onDestroy$?: Observable<boolean> | undefined;
    } | undefined, options?: {
        actionFop?: FlattenOps | undefined;
        stateFop?: FlattenOps | undefined;
    } | undefined);
}
