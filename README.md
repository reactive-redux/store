[![npm version](https://badge.fury.io/js/%40reactive-redux%2Fasync-store.svg)](https://badge.fury.io/js/%40reactive-redux%2Fasync-store)

# Reactive state container

## Install

#### `npm i @reactive-redux/async-store`

## Example

```typescript
import { of, Subject, interval } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  ActionMonad,
  AsyncStore,
  AsyncType,
  select
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

const initialState = {
  count: 0
};

const initialState$ = of(initialState);
const actions$ = actionQ.asObservable();

const store = new AsyncStore<State, ActionsUnion>({
  initialState$,
  actions$
});

store.state$.pipe(select(state => state.count)).subscribe(console.log);

const add100 = new Increment(100);

const add100times5 = interval(200).pipe(
  map(() => add100),
  take(5)
);

actionQ.next(add100times5);
```

## Changelog

## Want to help?
