import { IAction } from './interfaces';

export abstract class Action implements IAction {
  readonly type: string = '';
  constructor(public payload?: unknown) {
    Object.defineProperty(this, 'type', {
      get: () => this.constructor.name
    });
  }
}
