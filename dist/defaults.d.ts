import { Observable, OperatorFunction } from 'rxjs';
import { ActionMap, StoreConfig, StoreOptions, TransducerMap, IAction } from './interfaces';
import { ShareReplayConfig } from 'rxjs/internal/operators/shareReplay';
export declare function getDefaults<State, ActionsUnion extends IAction>(config?: StoreConfig<State, ActionsUnion>, options?: StoreOptions): {
    actionMap$: Observable<ActionMap<State, ActionsUnion>>;
    initialState$: Observable<State>;
    transducers$: Observable<TransducerMap<State, ActionsUnion>>;
    destroy$: Observable<boolean>;
    actionFactory$: (reducer: OperatorFunction<ActionsUnion, State>) => Observable<Observable<State>>;
    flattenState$: (fo?: <T>(o: Observable<T>) => Observable<T>) => (source: any) => any;
    shareReplayConfig: ShareReplayConfig;
};
