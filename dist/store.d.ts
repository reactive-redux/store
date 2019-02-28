import { Observable } from 'rxjs';
import { StoreConfig, StoreOptions } from './interfaces';
/**
 * Reactive state container based on RxJS (https://rxjs.dev/)
 *
 * @class AsyncStore<State, ActionsUnion>
 *
 * @type State - application state interface
 * @type ActionsUnion - type union of all the actions
 */
export declare class Store<State, ActionsUnion = any> {
    private config?;
    private options?;
    state$: Observable<State>;
    /**
     *
     * @param {Object} config
     *  {
     *     actionMap$: of({}),
     *     actions$: EMPTY, //(if not defined, no actions will be dispatched in the store)
     *     initialState$: of({}),
     *     metaReducers$: of({}),
     *     destroy$: NEVER //(if not defined, the state subscription will live forever)
     *  }
     *
     * @param {Object} options
     *  {
     *     actionFop: FlattenOps.concatMap, //(actions are executed in order of propagation)
     *     stateFop: FlattenOps.switchMap //(will update to the latest received state, without waiting for previous async operations to finish)
     *  }
     */
    constructor(config?: StoreConfig<State, ActionsUnion> | undefined, options?: StoreOptions | undefined);
}
export declare function createStore<State, ActionsUnion = any>(config?: StoreConfig<State, ActionsUnion>, opts?: StoreOptions): Store<State, ActionsUnion>;
