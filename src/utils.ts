import { pipe, from, of, isObservable, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AsyncType } from './interfaces';
import { Action } from 'ts-action';

export const isObject = (value: any) =>
  value !== null && typeof value === 'object';

export const hasType = (action: any) => typeof action.type === 'string';

export const compose = (fns: any[]) =>
  fns.reduce(
    (f, g) =>
      (...args: any[]) =>
        f(g(...args)),
  );

export const catchErr = pipe(catchError((e) => of(e)));

export const flatCatch = <T>(o: Observable<T>) => o.pipe<T>(catchErr);

export const mapToObservable = <T>(value: AsyncType<T>): Observable<T> => {
  if (isObservable(value)) return value;
  if (value instanceof Promise) return from(value);
  return of(value);
};

export function combineReducers<
  S extends Record<string, any>,
  A extends Action,
>(reducers: { [K in keyof S]: (state: S[K], action: A) => S[K] }): (
  state: S,
  action: A,
) => S {
  return (state: S = {} as S, action: A): S => {
    const { hasChanged, nextState } = (
      Object.entries(reducers) as Array<
        [keyof S, (state: S[keyof S], action: A) => S[keyof S]]
      >
    ).reduce(
      ({ hasChanged, nextState }, [key, reducer]) => {
        const prev = state[key];
        const next = reducer(prev, action);
        return {
          hasChanged: hasChanged || next !== prev,
          nextState: { ...nextState, [key]: next },
        };
      },
      { hasChanged: false, nextState: {} as S },
    );
    return hasChanged ? nextState : state;
  };
}
