import { pipe, Observable, from, of, isObservable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const compose = (fns: any[]) =>
  fns.reduce((f, g) => (...args: any[]) => f(g(...args)));

export const catchErr = pipe(catchError(e => of(e)));

export const mapToObservable = pipe(
  map(value => {
    if (isObservable(value)) return value;
    if (value instanceof Promise) return from(value);
    return of(value);
  })
);
