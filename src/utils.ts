import { pipe, from, of, isObservable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ReducerFn, IAction } from './interfaces';

export const _pipe = (fns: any[]) =>
  fns.reduceRight((f, g) => (...args: any[]) => f(g(...args)));

export const catchErr = pipe(catchError(e => of(e)));

export const mapToObservable = pipe(
  map(value => {
    if (isObservable(value)) return value;
    if (value instanceof Promise) return from(value);
    return of(value);
  })
);

export const mapS = <State>(mapFn: (state: State) => State) => (
  reducer: ReducerFn<State>
) => (state: State, action: IAction) => mapFn(reducer(state, action));

export const mapA = <State, A extends IAction>(mapFn: (action: A) => A) => (
  reducer: ReducerFn<State>
) => (state: State, action: A) => reducer(state, mapFn(action));

export const filterS = <State>(predicate: (state: State) => boolean) => (
  reducer: ReducerFn<State>
) => (state: State, action: IAction) => {
  const newState = reducer(state, action);
  return predicate(newState) ? newState : state;
};

export const filterA = <State, A extends IAction>(
  predicate: (action: A) => boolean
) => (reducer: ReducerFn<State>) => (state: State, action: A) => {
  return predicate(action) ? reducer(state, action) : state;
};
