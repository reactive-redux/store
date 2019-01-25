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
  FlattenOps,
  ActionMonad
} from '@reactive-redux/async-store';

//Counter example
interface State {
  count: number;
}

class Increment extends ActionMonad<State> {
  constructor(public payload: number) {
    super();
  }

  runWith(s, { payload }: Increment) {
    return {
      count: s.count + payload
    };
  }
}

class Decrement extends ActionMonad<State> {
  constructor(public payload: number) {
    super();
  }

  runWith(s, { payload }: Decrement) {
    return {
      count: s.count - payload
    };
  }
}

type ActionsUnion = Increment | Decrement;

const actionQ = new Subject<ActionsUnion>();
const onDestroy = new Subject<boolean>();
const initialState = {
  count: 0
};

const actionMap = {
  Increment,
  Decrement
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

const inc1 = new Increment(1);
const decr2 = new Decrement(2);

actionQ.next(inc1);
actionQ.next(inc1);
actionQ.next(inc1);
actionQ.next(decr2);
```

<!-- #### Counter example: [stackblitz](https://stackblitz.com/edit/async-store-counter) -->

<!-- #### [Full Example (stackblitz)](https://stackblitz.com/edit/async-store-todo) -->

## Changelog

#### Current version: 2.0.0

## Want to help?

Want to file a bug, contribute some code, or improve documentation? Excellent! Read up on our
guidelines for contribution and then check out some of our issues in the log.
