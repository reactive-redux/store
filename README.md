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
  AsyncType,
  select,
  createSelector,
  createStore
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

type ActionsUnion = IncrementBy | DecrementBy;

const actionQ = new Subject<AsyncType<ActionsUnion>>();

const initialState = {
  count: 0
};

const incrementBy = (state: State, action: IncrementBy) => ({
  ...state,
  count: state.count + action.payload
});

const decrementBy = (state: State, action: DecrementBy) => ({
  ...state,
  count: state.count - action.payload
});

const initialState$ = of(initialState);
const actions$ = actionQ.asObservable();
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

const add100 = new IncrementBy(100);

const add100times5 = interval(200).pipe(
  map(() => add100),
  take(5)
);

//dispaching an observable action
actionQ.next(add100times5);

state$.pipe(select(getCount)).subscribe(console.log);
```

## Changelog

## Want to help?
