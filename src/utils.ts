import { pipe, from, of, isObservable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ReducerFn } from './interfaces';

export const compose = (fns: any[]) =>
  fns.reduceRight((f, g) => (...args: any[]) => f(g(...args)));

export const catchErr = pipe(catchError(e => of(e)));

export const mapToObservable = pipe(
  map(value => {
    if (isObservable(value)) return value;
    if (value instanceof Promise) return from(value);
    return of(value);
  })
);

export const mapMeta = <State>(mapFn: (state: State) => State) => (
  reducer: ReducerFn<State>
) => (state: State) => mapFn(reducer(state));

export const filterMeta = <State>(
  predicate: (state: State) => boolean
) => (reducer: ReducerFn<State>) => (state: State) => {
  const newState = reducer(state);
  return predicate(newState) ? newState : state;
};
