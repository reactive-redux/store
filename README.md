[![npm version](https://badge.fury.io/js/%40reactive-redux%2Fasync-store.svg)](https://badge.fury.io/js/%40reactive-redux%2Fasync-store)

# Async reactive state container

## Install

#### `npm i @reactive-redux/async-store rxjs`

## Quickstart

```typescript
import { map, take } from 'rxjs/operators';
import { of, Subject, interval } from 'rxjs';
import {
  Action,
  AsyncStore,
  select,
  ActionMap,
  FlattenOps,
  ActionMonad,
  AsyncType
} from '@reactive-redux/async-store';

//Counter example
interface State {
  count: number;
}

class Increment extends ActionMonad<State> {
  constructor(public payload: number) {
    super();
  }

  runWith(s: State) {
    return {
      count: s.count + this.payload
    };
  }
}

class Decrement extends ActionMonad<State> {
  constructor(public payload: number) {
    super();
  }

  runWith(s: State) {
    return {
      count: s.count - this.payload
    };
  }
}

type ActionsUnion = Increment | Decrement;

const actionQ = new Subject<AsyncType<ActionsUnion>>();
const onDestroy = new Subject<boolean>();
const initialState = {
  count: 0
};

const config = {
  initialState$: of(initialState),
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

const inc10 = new Increment(10);
const decr2 = new Decrement(2);

actionQ.next(inc1);
actionQ.next(inc1);
actionQ.next(inc1);
actionQ.next(decr2);

const add10times2 = interval(200).pipe(
  map(() => inc10),
  take(2)
);

actionQ.next(add10times2);
```

<!-- #### Counter example: [stackblitz](https://stackblitz.com/edit/async-store-counter) -->

<!-- #### [Full Example (stackblitz)](https://stackblitz.com/edit/async-store-todo) -->

## Changelog

## Want to help?

Want to file a bug, contribute some code, or improve documentation? Excellent! Read up on our
guidelines for contribution and then check out some of our issues in the log.
