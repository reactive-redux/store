import { Observable } from 'rxjs';
export declare const compose: (fns: any[]) => any;
export declare const catchErr: import("rxjs/internal/types").UnaryFunction<Observable<{}>, Observable<any>>;
export declare const mapToObservable: import("rxjs/internal/types").UnaryFunction<Observable<{}>, Observable<Observable<any>>>;
