import { Observable, OperatorFunction, Subject } from 'rxjs';
import { Action } from 'ts-action';
import { StoreConfig, StoreOptions, Middleware, ReducerFn } from './interfaces';
import { ShareReplayConfig } from 'rxjs/internal/operators/shareReplay';
export declare function getDefaults<State, ActionsUnion extends Action>(config: StoreConfig<State, ActionsUnion> | undefined, options: StoreOptions | undefined, dispatchSubject: Subject<ActionsUnion>): {
    reducer$: Observable<ReducerFn<State, ActionsUnion>>;
    actions$: Subject<ActionsUnion>;
    actionStream$: (reducer: OperatorFunction<any, State>) => Observable<any>;
    initialState$: Observable<State>;
    middleware$: Observable<Middleware<State, ActionsUnion>>;
    destroy$: Observable<boolean>;
    flattenState$: <T>(source: Observable<T>) => Observable<T>;
    shareReplayConfig: ShareReplayConfig;
};
