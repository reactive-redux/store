import { Action, AsyncType } from './interfaces';

export abstract class ActionMonad<State> implements Action {
  readonly type: string = '';
  constructor(public payload?: unknown) {
    Object.defineProperty(this, 'type', {
      get: () => this.constructor.name
    });
  }

  abstract runWith(
    state: AsyncType<State>,
    action: unknown
  ): AsyncType<State>;
}
