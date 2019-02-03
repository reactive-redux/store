[![npm version](https://badge.fury.io/js/%40reactive-redux%2Fasync-store.svg)](https://badge.fury.io/js/%40reactive-redux%2Fasync-store)

# Reactive state container

## Install

#### `npm i @reactive-redux/async-store`

## Example

```typescript
import { of, Subject, interval } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  Action,
  AsyncStore,
  AsyncType,
  select
} from '@reactive-redux/async-store';

//Counter example
interface State {
  count: number;
}

class Increment extends Action {
  constructor(public payload: number) {
    super();
  }
}

class Decrement extends Action {
  constructor(public payload: number) {
    super();
  }
}

type ActionsUnion = Increment | Decrement;

const actionQ = new Subject<AsyncType<ActionsUnion>>();

const initialState = {
  count: 0
};

const initialState$ = of(initialState);
const actions$ = actionQ.asObservable();

const actionMap$ = of({
  [Increment.name]: (state: State, action: Increment) => ({
    ...state,
    count: state.count + action.payload
  }),
  [Decrement.name]: (state: State, action: Decrement) => ({
    ...state,
    count: state.count - action.payload
  })
});

const store = new AsyncStore<State, ActionsUnion>({
  initialState$,
  actions$,
  actionMap$
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
