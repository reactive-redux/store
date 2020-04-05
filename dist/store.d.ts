import { Observable } from 'rxjs';
import { StoreConfig, StoreOptions, IAction } from './interfaces';
/**
 * Reactive state container based on RxJS (https://rxjs.dev/)
 *
 * @class AsyncStore<State, ActionsUnion>
 *
 * @type State - application state interface
 * @type ActionsUnion - type union of all the actions
 */
export declare class Store<State = {}, ActionsUnion extends IAction<any> = any> {
    private config?;
    private options?;
    private _dispatch$;
    state$: Observable<State>;
    actions$: Observable<ActionsUnion>;
    /**
     * Default configuration
     *
     * @param {Object} config
     *  {
     *     reducer$: of(reducer({})),
     *     actionStream$: EMPTY, // if not defined, no actions will be dispatched in the store
     *     initialState$: of({}),
     *     middleware$: of([]),
     *     destroy$: NEVER // if not defined, the state subscription will live forever
     *  }
     *
     * @param {Object} options
     *  {
     *     actionFop: FlattenOps.concatMap, // Flatten operator for actions's stream.
     *     stateFop: FlattenOps.switchMap // Flatten operator for state's stream.
     *     windowTime: undefined //Maximum time length of the replay buffer in milliseconds.
     *     bufferSize: 1 //Maximum element count of the replay buffer.
     *  }
     */
    constructor(config?: StoreConfig<State, ActionsUnion> | undefined, options?: StoreOptions | undefined);
    dispatch: (action: ActionsUnion) => void;
}
export declare function createStore<State = {}, ActionsUnion extends IAction = any>(config?: StoreConfig<State, ActionsUnion>, opts?: StoreOptions): Store<State, ActionsUnion>;
