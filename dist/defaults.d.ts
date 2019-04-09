import { Observable } from 'rxjs';
import { ActionMap, AsyncType, StoreConfig, StoreOptions, IAction } from './interfaces';
import { ShareReplayConfig } from 'rxjs/internal/operators/shareReplay';
export declare function getDefaults<State, ActionsUnion extends IAction>(config?: StoreConfig<State, ActionsUnion>, options?: StoreOptions): {
    actionMap$: Observable<ActionMap<State, ActionsUnion>>;
    actionStream$: Observable<AsyncType<ActionsUnion>>;
    currentActions$: Observable<{
        [key: string]: (payload?: unknown) => any;
    }>;
    initialState$: Observable<State>;
    transducers$: Observable<import("./interfaces").TransducerFn<State, ActionsUnion>[]>;
    destroy$: Observable<boolean>;
    actionFlatten: any;
    flattenState$: (source: any) => any;
    shareReplayConfig: ShareReplayConfig;
};
