import { Observable, OperatorFunction, Subject } from 'rxjs';
import { StoreConfig, StoreOptions, Middleware, IAction, ReducerFn } from './interfaces';
import { ShareReplayConfig } from 'rxjs/internal/operators/shareReplay';
export declare function getDefaults<State, ActionsUnion extends IAction>(config?: StoreConfig<State, ActionsUnion>, options?: StoreOptions): {
    reducer$: Observable<ReducerFn<State, ActionsUnion>>;
    actions$: Subject<ActionsUnion>;
    actionStream$: (reducer: OperatorFunction<any, State>) => Observable<any>;
    initialState$: Observable<State>;
    middleware$: Observable<Middleware<State, ActionsUnion>>;
    destroy$: Observable<boolean>;
    flattenState$: <T>(source: Observable<T>) => Observable<T>;
    shareReplayConfig: ShareReplayConfig;
};
