import { Observable, OperatorFunction, Subject } from 'rxjs';
import { StoreConfig, StoreOptions } from './interfaces';
import { ShareReplayConfig } from 'rxjs/internal/operators/shareReplay';
import { Action } from 'ts-action';
export declare function getDefaults<State, ActionsUnion extends Action>(config?: StoreConfig<State>, options?: StoreOptions): {
    reducer$: Observable<any>;
    actions$: Subject<ActionsUnion>;
    actionStream$: (reducer: OperatorFunction<any, State>) => Observable<any>;
    initialState$: Observable<State>;
    middleware$: Observable<import("./interfaces").MiddlewareFn<State, ActionsUnion>[]>;
    destroy$: Observable<boolean>;
    flattenState$: <T>(source: Observable<T>) => Observable<T>;
    shareReplayConfig: ShareReplayConfig;
};
