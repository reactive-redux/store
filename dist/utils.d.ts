import { Observable } from 'rxjs';
export declare const compose: <T>(fns: any[]) => T;
export declare const mapToObservable: import("rxjs/internal/types").UnaryFunction<Observable<{}>, Observable<Observable<any>>>;
