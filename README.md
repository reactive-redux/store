[![npm version](https://badge.fury.io/js/%40reactive-redux%2Fstore.svg)](https://badge.fury.io/js/%40reactive-redux%2Fstore)

# Reactive state container

## Install

#### `npm i @reactive-redux/store`

## Example

```typescript
import { of, Subject, interval } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  Action,
  Store,
  AsyncType,
  select,
  createSelector
} from '@reactive-redux/store';

//Counter example
interface State {
  count: number;
}

class IncrementBy extends Action {
  constructor(public payload: number) {
    super();
  }
}

class DecrementBy extends Action {
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

const incrementBy = (state: State, action: Increment) => ({
  ...state,
  count: state.count + action.payload
});

const decrementBy = (state: State, action: Decrement) => ({
  ...state,
  count: state.count - action.payload
});

const actionMap$ = of({
  [IncrementBy.name]: incrementBy,
  [DecrementBy.name]: decrementBy
});

const { state$ } = createStore<State, ActionsUnion>({
  initialState$,
  actions$,
  actionMap$
});

const getCount = createSelector<State, State, number>(
  state => state,
  state => state.count
);

state$.pipe(select(getCount)).subscribe(console.log);

const add100 = new IncrementBy(100);

const add100times5 = interval(200).pipe(
  map(() => add100),
  take(5)
);

actionQ.next(add100times5);
```

## Changelog

## Want to help?
