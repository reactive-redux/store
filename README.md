[![npm version](https://badge.fury.io/js/%40reactive-redux%2Fasync-store.svg)](https://badge.fury.io/js/%40reactive-redux%2Fasync-store)

# Async reactive state container

## Quickstart

#### `npm i @reactive-redux/async-store`

---

```typescript
import { of, Subject } from 'rxjs';
import {
  Action,
  AsyncStore,
  select,
  ActionMap,
  FlattenOps
} from '@reactive-redux/async-store';

//Counter example
interface State {
  count: number;
}

enum ActionsEnum {
  INC = '[App] Increment',
  DECR = '[App] Decrement'
}

class Increment implements Action {
  readonly type = ActionsEnum.INC;
}

class Decrement implements Action {
  readonly type = ActionsEnum.DECR;
}

type ActionsUnion = Increment | Decrement;

const actionQ = new Subject<ActionsUnion>();
const onDestroy = new Subject<boolean>();
const initialState = {
  count: 0
};

const actionMap = {
  [ActionsEnum.INC]: (state: State, action: Increment): State => ({
    count: state.count += 1
  }),
  [ActionsEnum.DECR]: (state: State, action: Decrement): State => ({
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

const opts = {
  actionFop: FlattenOps.concatMap, //Action flattening operator default: concatMap
  stateFop: FlattenOps.switchMap //State flattening operator default: switchMap
};

const store = new AsyncStore<State, ActionsUnion>(config, opts);

store.state$.pipe(select(state => state.count)).subscribe(console.log);

actionQ.next(new Increment());
actionQ.next(new Increment());
actionQ.next(new Increment());
actionQ.next(new Decrement());
```

#### Counter example: [stackblitz](https://stackblitz.com/edit/async-store-counter)

#### [Full Example (stackblitz)](https://stackblitz.com/edit/async-store-todo)

## Changelog

#### Current version: 1.3.0

## Want to help?

Want to file a bug, contribute some code, or improve documentation? Excellent! Read up on our
guidelines for contribution and then check out some of our issues in the log.
