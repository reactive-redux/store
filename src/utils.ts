import { pipe, Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';

export const compose = <T>(fns: any[]): T =>
  fns.reduce((f, g) => (...args: any[]) => f(g(...args)));

export const mapToObservable = pipe(
  map(value =>
    value instanceof Promise || value instanceof Observable
      ? from(value)
      : of(value)
  )
);
