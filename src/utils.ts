import { pipe, from, of, isObservable, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IAction, AsyncType, ActionMap } from './interfaces';

export const isObject = (value: any) => value !== null && typeof value === 'object';

export const hasType = (action: any) => typeof action.type === 'string';

export const isValidAction = (action: IAction, map: ActionMap<any>) =>
  hasType(action) &&
  map.hasOwnProperty(action.type) &&
  typeof map[action.type] === 'function';

export const _pipe = (fns: any[]) =>
  fns.reduceRight((f, g) => (...args: any[]) => f(g(...args)));

export const catchErr = pipe(catchError(e => of(e)));

export const flattenObservable = <T>(o: Observable<T>) => o.pipe<T>(catchErr);

export const mapToObservable = <T>() =>
  pipe(
    map((value: AsyncType<T>) => {
      if (isObservable(value)) return value;
      if (value instanceof Promise) return from(value);
      return of(value);
    })
  );
