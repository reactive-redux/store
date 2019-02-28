import { Observable } from 'rxjs';
import { ActionMap, AsyncType, StoreConfig, StoreOptions, TransducerMap } from './interfaces';
export declare function getDefaults<State, ActionsUnion>(config?: StoreConfig<State, ActionsUnion>, options?: StoreOptions): {
    actionMap$: Observable<ActionMap<State>>;
    actions$: Observable<AsyncType<ActionsUnion>>;
    initialState$: Observable<State>;
    transducers$: Observable<TransducerMap<State>>;
    destroy$: Observable<boolean>;
    actionFop: any;
    stateFop: any;
};
