# Reactive state container

## Install

#### `npm i rxjs ts-action reselect @reactive-redux/store`

## Examples

### Basic Store

```typescript
import { of, Subject } from 'rxjs';
import { createStore } from '@reactive-redux/store';
import { action, on, payload, reducer } from "ts-action";

const actionQ = new Subject<ActionsUnion>();

const increment = action("Increment", payload<{ value: number }>());
const decrement = action("Decrement", payload<{ value: number }>());

interface State {
  value: number;
}

const initialState: State = { value: 0 };

const { state$ } = createStore<State, ActionsUnion>({
  actionStream$: actionQ.asObservable(),
  reducer$: of(reducer(initialState,
    on(increment, (state, { payload }) => ({ value: state.value + payload.value })),
    on(decrement, (state, { payload }) => ({ value: state.value - payload.value }))
  )),
  initialState$: of(initialState),
});

state$.subscribe(console.log);
actionQ.next(increment({ value: 1 }));
```

### Effects with `epic$`

The `epic$` option allows you to handle side effects (API calls, etc.) and dispatch new actions.

```typescript
import { createStore, ofType, createEffect, createEpicRegistry } from '@reactive-redux/store';

const fetchUserEffect$ = createEffect()(
  (action$) => action$.pipe(
    ofType(fetchUser),
    mergeMap(action =>
      userService.getUser(action.payload.id).pipe(
        map(user => fetchUserSuccess({ user })),
        catchError(error => of(fetchUserFailure({ error })))
      )
    )
  )
);

const store = createStore<AppState, ActionsUnion>({
  actionStream$,
  reducer$,
  initialState$,
  epic$: createEpicRegistry(fetchUserEffect$),
});
```

### Action Creators with `ofType`

```typescript
import { action, payload } from 'ts-action';

// Define actions
const login = action('LOGIN', payload<{ email: string; password: string }>());
const logout = action('LOGOUT');

// Use ofType to filter actions in effects
const authEffect$ = createEffect()(
  (action$) => action$.pipe(
    ofType(login),  // filters for LOGIN actions only
    mergeMap(({ payload }) =>
      authService.login(payload.email, payload.password).pipe(
        map(response => loginSuccess({ user: response.user })),
        catchError(error => of(loginFailure({ error })))
      )
    )
  )
);
```

### Subscription Effects with `createSubscriptionEffect`

For effects that need cleanup when the store is destroyed:

```typescript
import { Subject } from 'rxjs';

const destroy$ = new Subject<void>();

const websocketEffect$ = createSubscriptionEffect(destroy$)(
  (action$) => action$.pipe(
    ofType(connectWebsocket),
    switchMap(() =>
      websocket.connect().pipe(
        map(message => websocketMessageReceived({ message })),
        catchError(error => of(websocketError({ error })))
      )
    )
  )
);

// When destroying the store:
destroy$.next();
destroy$.complete();
```

### `epic$` with Multiple Effects

Use `createEpicRegistry` to combine multiple effects:

```typescript
const rootEpic = createEpicRegistry(
  authEffect$,
  userEffect$,
  websocketEffect$,
  // ... more effects
);

const store = createStore<AppState, ActionsUnion>({
  actionStream$,
  reducer$,
  initialState$,
  epic$: rootEpic,
  destroy$,
});
```

### Redux DevTools

Connect a store to the [Redux DevTools browser extension](https://github.com/reduxjs/redux-devtools)
with one config option — every dispatched action is logged next to the state
it produced, and time travel (jumping to a past action in the DevTools UI)
works out of the box:

```typescript
const store = createStore<AppState, ActionsUnion>({
  reducer$,
  initialState$,
  devTools: { name: 'MyStore' },
});
```

The option is also a plain toggle, so gating it per environment is a one-liner:

```typescript
devTools: true,                                          // on, default name
devTools: process.env.NODE_ENV !== 'production',         // simple toggle
devTools: !IS_PROD && { name: 'MyStore', maxAge: 100 },  // toggle + options
```

Options: `name` (instance name in the DevTools selector, default `'RxDI Store'`),
`maxAge` (action history size, default `50`), `enabled` (runtime toggle,
default `true`), `extensionOptions` (forwarded verbatim to the extension —
`actionSanitizer`, `stateSanitizer`, `serialize`, `trace`, ...).

The bridge is inert when the extension is not installed (including SSR/Node),
and disconnects automatically when `destroy$` emits. Multiple stores show up
as separate named instances in the extension. Note that time travel restores
state through JSON, so non-serializable state still logs fine but jumps
restore a JSON approximation.

For stores constructed in exotic ways, the standalone pieces are exported too:

```typescript
import { connectReduxDevTools, withDevToolsTimeTravel } from '@rxdi/redux-store';

const store = createStore({ reducer$: of(withDevToolsTimeTravel(reducerFn)), initialState$ });
const disconnect = connectReduxDevTools(store, { name: 'MyStore' }); // connect before dispatching
```

> **Warning:** dispatch actions through `store.dispatch()` only. Feeding the
> same action into both `dispatch()` and a subject wired as `actionStream$`
> runs the reducer twice per action (and logs it twice in DevTools).

## Architecture patterns

The patterns below come from production games built on this store (a PixiJS
card game and a crash game). They compose three ideas: **slice stores combined
into one root store**, **effects that chain multiple actions**, and **effects
that drive an imperative renderer**.

### Combining slice stores into one root store

Instead of running several independent stores, keep each concern ("chunk") in
its own directory with its own actions, reducer, and state — then compose them
into a single root store with `combineReducers`. One store means one dispatch,
one DevTools instance, and effects that can react to any slice's actions while
reading the whole state.

```typescript
// game/          — server game state slice (actions, reducer, initial state)
// render-store/  — visual/render state slice (actions, reducer, initial state)

import { combineReducers } from '@rxdi/redux-store';

export interface AppState {
  game: GameState;
  render: RenderState;
}

// The root action type is the UNION of every slice's actions —
// this is how multiple action sets live in one store.
export type AppAction = GameAction | RenderAction;

export const initialAppState: AppState = {
  game: initialGameState,
  render: initialRenderState,
};

export const appReducer = combineReducers<AppState, AppAction>({
  game: gameReducer,
  render: renderReducer,
});
```

Each slice reducer only handles the actions it knows; `combineReducers`
returns the same state reference when nothing changed, so slice selectors
built with `distinctUntilChanged` don't re-emit.

One state machine owns the root store and registers ALL effects — game
effects and render effects — in a single epic registry:

```typescript
@Injectable()
export class AppStateMachine {
  private destroy$ = new Subject<void>();
  private actions$ = new Subject<AppAction>();
  private store = createStore<AppState, AppAction>({
    actionStream$: this.actions$.asObservable(),
    reducer$: of(appReducer),
    initialState$: of(initialAppState),
    epic$: createEpicRegistry(
      // game effects
      this.gameEffects.playCardEffect$,
      this.gameEffects.matchEventsSubscription$,
      // render effects
      this.renderEffects.syncBoard$,
      this.renderEffects.playCard$,
    ),
    destroy$: this.destroy$,
    devTools: { name: 'App' },
  });

  // Slice selectors: one shared base stream, then map + distinctUntilChanged.
  private base$ = this.store.state$.pipe(shareReplay(1));
  private game$ = this.base$.pipe(map(s => s.game), distinctUntilChanged(), shareReplay(1));
  private render$ = this.base$.pipe(map(s => s.render), distinctUntilChanged(), shareReplay(1));

  dispatch(action: AppAction): void {
    this.actions$.next(action);
  }
}
```

### Chaining multiple actions from one effect

Effects return action streams — emitting several actions in sequence chains
work: acquire a lock, call the server, apply the result, release the lock.
Because reducers are synchronous and actions are flattened with `concatMap`,
every synchronous link of the chain (dispatch → reducer → state emission →
effect sees the action → follow-up dispatch) runs **in the same tick as the
originating DOM event** — the whole cascade settles before the browser paints.
Only genuinely async steps (server round-trips, animation promises) yield.

```typescript
playCardEffect$ = createEffect()((action$) =>
  action$.pipe(
    ofType(playCard),
    exhaustMap((action) =>
      concat(
        of(acquireAnimationLock({ matchId: action.payload.matchId })),   // 1st action, same tick
        this.api.playCard(action.payload).pipe(                          // async boundary
          switchMap(() => this.api.getMatch(action.payload.matchId)),
          mergeMap((state) =>
            of(                                                           // two more actions, back to back
              updateMatchState(state),
              releaseAnimationLock({ matchId: action.payload.matchId }),
            ),
          ),
        ),
      ),
    ),
  ),
);
```

Flattening-operator choice encodes the interaction policy: `exhaustMap`
ignores re-entrant triggers while a chain is in flight (clicking "attack"
during the attack animation does nothing), `switchMap` restarts, `concatMap`
queues.

### Driving an imperative renderer (PixiJS) with effects

Rendering engines like PixiJS are imperative — you call methods on them. The
pattern keeps the store pure by making the renderer a side effect, with
actions flowing in both directions:

**Store → renderer** — `dispatch: false` effects `tap` renderer methods. The
renderer instance lives in a tiny injectable holder service (it's created at
canvas-mount time, not construction time):

```typescript
@Injectable()
export class RendererService {
  private _renderer: GameRenderer | null = null;
  get renderer() { return this._renderer; }
  set(r: GameRenderer) { this._renderer = r; }
  clear() { this._renderer = null; }
}

// Pure visual sync — no store mutation, no follow-up actions:
syncBoard$ = createEffect({ dispatch: false })((action$) =>
  action$.pipe(
    ofType(renderSyncBoard),
    tap(({ payload }) => this.rendererService.renderer?.updateMatchState(payload.match)),
  ),
);
```

**Renderer → store** — pixi/DOM callbacks dispatch *render intent* actions
through a typed dispatcher facade; effects translate intent into game actions,
enriching from the current state:

```typescript
// Engine wiring (canvas events → intent actions):
renderer.onLaneClicked = (lane) =>
  this.app.dispatch(renderPlayCard({ cardId: this.selectedCardId, lane }));

// Effect (intent → game action, same tick):
playCard$ = createEffect()((action$, state$) =>
  action$.pipe(
    ofType(renderPlayCard),
    withLatestFrom(state$),
    map(([{ payload }, state]: [any, AppState]) =>
      playCard({
        matchId: state.game.match?.matchId || '',
        playerId: state.game.myPlayerId,
        cardId: payload.cardId,
        lane: payload.lane,
      }),
    ),
  ),
);
```

**Animations gate the chain** — wrap the animation promise and only dispatch
the follow-up action when it resolves; `exhaustMap` swallows clicks while the
animation plays:

```typescript
attackEntity$ = createEffect()((action$, state$) =>
  action$.pipe(
    ofType(renderAttackEntity),
    withLatestFrom(state$),
    exhaustMap(([{ payload }, state]) =>
      from(this.renderer.animateAttackEntity(payload.attackerId, payload.defenderId)).pipe(
        map(() => attack({ /* fires only after the animation finishes */ })),
      ),
    ),
  ),
);
```

The result: components and the pixi engine dispatch pure events; reducers stay
pure; every imperative renderer call and every animation is an effect reacting
to an action — visible in DevTools, testable by dispatching actions and
asserting on the renderer mock.

## API

### `createStore<State, ActionsUnion>(config, options)`

Creates a reactive store.

**Config options:**
- `actionStream$: Observable<ActionsUnion>` - Stream of actions
- `reducer$: Observable<ReducerFn<State, ActionsUnion>>` - Reducer observable
- `initialState$: Observable<State>` - Initial state observable
- `middleware$?: Observable<Middleware[]>` - Middleware
- `destroy$?: Observable<any>` - Destruction trigger
- `epic$?: EpicFn<State, ActionsUnion>` - Effects epic function
- `devTools?: boolean | DevToolsOptions` - Redux DevTools extension bridge (see above)

### `ofType<Action>(...actionCreators)`

Filters an action stream by action type(s).

### `createEffect(options?)`

Factory for creating effects. Options: `{ dispatch: true | false }`

### `createSubscriptionEffect(destroy$)`

Factory for subscription-style effects with auto `takeUntil(destroy$)`.

### `createEpicRegistry<State, Action>(...effects)`

Combines multiple effect functions into a single epic.

### `combineReducers<State, Action>(reducers)`

Composes per-slice reducers into one root reducer. Returns the previous state
reference when no slice changed (plays well with `distinctUntilChanged`).

### `EpicFn<State, Action>`

Type definition for epic functions:
```typescript
(action$: Observable<Action>, state$: Observable<State>) => Observable<Action>
```

## Changelog

## Want to help?