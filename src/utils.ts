import { pipe, from, of, isObservable, Observable, OperatorFunction } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import {
  AsyncType,
  IAction,
} from './interfaces';

export const isObject = (value: any) => value !== null && typeof value === 'object';

export const hasType = (action: any) => typeof action.type === 'string';

export const compose = (fns: any[]) => fns.reduce((f, g) => (...args: any[]) => f(g(...args)));

export const catchErr = pipe(catchError(e => of(e)));

export const flatCatch = <T>(o: Observable<T>) => o.pipe<T>(catchErr);

export const mapToObservable = <T>(value: AsyncType<T>): Observable<T> => {
  if (isObservable(value)) return value;
  if (value instanceof Promise) return from(value);
  return of(value);
};

export function ofType<T extends IAction>(
  ...allowedTypes: string[]
): OperatorFunction<IAction, T> {
  return filter(
    (action: IAction): action is T => allowedTypes.some(type => type === action.type)
  );
}
