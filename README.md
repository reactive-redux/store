[![npm version](https://badge.fury.io/js/%40reactive-redux%2Fasync-store.svg)](https://badge.fury.io/js/%40reactive-redux%2Fasync-store)

# Async reactive state container

## Quickstart

#### Install: `npm i @reactive-redux/async-store`

#### [Full Example (stackblitz)](https://stackblitz.com/edit/reactive-async-store?embed=1&file=index.ts)

---

```typescript
import { of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Action,
  AsyncStore,
  select
} from '@reactive-redux/async-store';

//Counter example
interface State {
  count: number;
}

enum Actions {
  INC = '[App] Increment',
  DECR = '[App] Decrement'
}

class Increment implements Action {
  readonly type = Actions.INC;
}

class Decrement implements Action {
  readonly type = Actions.DECR;
}

type ActionsUnion = Increment | Decrement;

const actionQ = new Subject<ActionsUnion>();
const onDestroy = new Subject<boolean>();
const initialState = {
  count: 0
};
const actionMap = {
  [Actions.INC]: (state: State, action: Increment): State => ({
    count: state.count += 1
  }),
  [Actions.DECR]: (state: State, action: Decrement): State => ({
    count: state.count -= 1
  })
};

const config = {
  initialState$: of(initialState),
  actionMap$: of(actionMap),
  metaMap$: of({}),
  actionQ$: actionQ.asObservable(),
  onDestroy$: onDestroy.asObservable()
};

const store = new AsyncStore<State, ActionsUnion>(config);

store.state$
  .pipe(select(state => state.count))
  .subscribe(console.log);

actionQ.next(new Increment());
actionQ.next(new Increment());
actionQ.next(new Increment());
actionQ.next(new Decrement());
```

#### Counter example: [stackblitz](https://stackblitz.com/edit/reactive-store-counter?file=index.ts)

## Changelog

#### Current version: 1.1.0

## Want to help?

Want to file a bug, contribute some code, or improve documentation? Excellent! Read up on our
guidelines for contribution and then check out some of our issues in the log.
