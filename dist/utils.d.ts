import { Observable } from 'rxjs';
import { AsyncType, ActionMap } from './interfaces';
export declare const isObject: (value: any) => boolean;
export declare const hasType: (action: any) => boolean;
export declare const isValidAction: (action: any, map: ActionMap<any>) => boolean;
export declare const _pipe: (fns: any[]) => any;
export declare const catchErr: import("rxjs").UnaryFunction<Observable<{}>, Observable<any>>;
export declare const flattenObservable: <T>(o: Observable<T>) => Observable<T>;
export declare const mapToObservable: <T>() => import("rxjs").UnaryFunction<Observable<AsyncType<T>>, Observable<Observable<T>>>;
