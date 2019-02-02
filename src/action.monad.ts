import { Action } from './interfaces';

export abstract class ActionMonad<State> implements Action {
  readonly type: string = '';
  constructor(public payload?: unknown) {
    Object.defineProperty(this, 'type', {
      get: () => this.constructor.name
    });
  }

  abstract runWith(state: State): State;
}
