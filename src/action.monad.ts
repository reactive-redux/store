import { Action } from './interfaces';
import { Observable } from 'rxjs';

export abstract class ActionMonad<State> implements Action {
  readonly type: string = '';
  constructor(public payload?: unknown) {
    Object.defineProperty(this, 'type', {
      get: () => this.constructor.name
    });
  }

  abstract runWith(
    state: State | Promise<State> | Observable<State>,
    action: unknown
  ): State | Promise<State> | Observable<State>;
}
