import { Observable, OperatorFunction, Subject } from 'rxjs';
import { StoreConfig, StoreOptions, Middleware } from './interfaces';
import { ShareReplayConfig } from 'rxjs/internal/operators/shareReplay';
import { Action, Reducer } from 'ts-action';
export declare function getDefaults<State, ActionsUnion extends Action>(config?: StoreConfig<State, ActionsUnion>, options?: StoreOptions): {
    reducer$: Observable<Reducer<State>>;
    actions$: Subject<ActionsUnion>;
    actionStream$: (reducer: OperatorFunction<any, State>) => Observable<any>;
    initialState$: Observable<State>;
    middleware$: Observable<Middleware<State, ActionsUnion>>;
    destroy$: Observable<boolean>;
    flattenState$: <T>(source: Observable<T>) => Observable<T>;
    shareReplayConfig: ShareReplayConfig;
};
