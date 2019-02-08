import { Observable } from 'rxjs';
import { MetaReducerMap, FlattenOps, AsyncType, ActionMap } from './interfaces';
/**
 * State container based on RxJS observables
 *
 *
 *
 * @class AsyncStore<State, ActionsUnion>
 */
export declare class Store<State, ActionsUnion = any> {
    private config?;
    private options?;
    static readonly flattenOp: {
        [key in FlattenOps]: any;
    };
    state$: Observable<State>;
    /**
     * Config defaults:
     *    actionMap$ = of({})
     *    actions$ = new Subject() (if not defined, no actions will be dispatched in the store)
     *    initialState$ = of({})
     *    metaReducers$ = of({})
     *    destroy$ = new Subject() (if not defined, the state subscription is never destroyed)
     *
     * Options defaults:
     *    actions = concatMap (actions are executed in order of propagation)
     *    state = switchMap (will update to the latest received state, without waiting for previous async operations to finish)
     */
    constructor(config?: {
        actionMap$?: Observable<ActionMap<State>> | undefined;
        actions$?: Observable<AsyncType<ActionsUnion>> | undefined;
        initialState$?: Observable<State> | undefined;
        metaReducers$?: Observable<MetaReducerMap<State>> | undefined;
        onDestroy$?: Observable<boolean> | undefined;
    } | undefined, options?: {
        actionFop?: FlattenOps | undefined;
        stateFop?: FlattenOps | undefined;
    } | undefined);
}
