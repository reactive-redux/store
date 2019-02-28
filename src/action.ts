import { IAction } from './interfaces';
import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

export class Action implements IAction {
  constructor(public payload?: unknown) {}

  get type() {
    return this.constructor.name;
  }
}

export function ofType<T extends IAction>(
  ...allowedTypes: string[]
): OperatorFunction<IAction, T> {
  return filter(
    (action: IAction): action is T =>
      allowedTypes.some(type => type === action.type)
  );
}
