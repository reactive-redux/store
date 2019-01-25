import { pipe, Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const compose = (fns: any[]) =>
  fns.reduce((f, g) => (...args: any[]) => f(g(...args)));

export const catchErr = pipe(catchError(e => of(e)));

export const mapToObservable = pipe(
  map(value =>
    value instanceof Promise || value instanceof Observable
      ? from(value)
      : of(value)
  )
);
