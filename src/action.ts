import { IAction } from './interfaces';

const lowercased = (str: string) => str.replace(/^\w/, c => c.toLowerCase());
export class Action implements IAction {
  constructor(public payload?: unknown) {}

  get type() {
    return lowercased(this.constructor.name);
  }
}
