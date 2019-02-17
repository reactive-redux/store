import { Observable } from 'rxjs';
import { FlattenOps, StoreConfig, StoreOptions } from './interfaces';
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
    static readonly FlattenOperators: {
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
    constructor(config?: StoreConfig<State, ActionsUnion> | undefined, options?: StoreOptions | undefined);
}
export declare function createStore<State, ActionsUnion = any>(config?: StoreConfig<State, ActionsUnion>, opts?: StoreOptions): Store<State, ActionsUnion>;
