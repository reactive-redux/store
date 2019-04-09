import { IAction } from './interfaces';

export class Action implements IAction {
  constructor(public payload?: unknown) {}

  get type() {
    return this.constructor.name.toLowerCase();
  }
}
