import { Observable } from 'rxjs';
import { ActionMap, MetaReducerMap, AsyncType, StoreConfig, StoreOptions } from './interfaces';
export declare function getDefaults<State, ActionsUnion>(config?: StoreConfig<State, ActionsUnion>, options?: StoreOptions): {
    actionMap$: Observable<ActionMap<State>>;
    actions$: Observable<AsyncType<ActionsUnion>>;
    initialState$: Observable<State>;
    metaReducers$: Observable<MetaReducerMap<State>>;
    destroy$: Observable<boolean>;
    actionFop: any;
    stateFop: any;
};
