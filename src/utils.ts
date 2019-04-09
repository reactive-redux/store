import { pipe, from, of, isObservable, Observable, OperatorFunction } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import {
  AsyncType,
  ActionMap,
  IAction,
  ReducerFn,
  ActionCreator
} from './interfaces';

export const isObject = (value: any) => value !== null && typeof value === 'object';

export const hasType = (action: any) => typeof action.type === 'string';

export const isValidAction = <State, ActionsUnion extends IAction>(
  action: ActionsUnion,
  map: ActionMap<State, ActionsUnion>
) =>
  hasType(action) &&
  map.hasOwnProperty(action.type) &&
  typeof map[action.type] === 'function';

export const _pipe = (fns: any[]) =>
  fns.reduce((f, g) => (...args: any[]) => f(g(...args)));

export const catchErr = pipe(catchError(e => of(e)));

export const flattenObservable = <T>(o: Observable<T>) => o.pipe<T>(catchErr);

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

const capitalize = (str: string) => str.replace(/^\w/, c => c.toUpperCase());
export const createActions: ActionCreator = (actions: ReducerFn<any, any>[]) =>
  actions.reduce(
    (acc, curr) => {
      if (typeof curr !== 'function') return acc;

      return {
        actions: {
          ...acc.actions,
          [capitalize(curr.name)]: (payload: any) => ({ type: curr.name, payload })
        },
        actionMap$: { ...acc.actionMap$, [curr.name]: curr }
      };
    },
    { actionMap$: {}, actions: {} }
  );
