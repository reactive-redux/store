[![npm version](https://badge.fury.io/js/%40reactive-redux%2Fstore.svg)](https://badge.fury.io/js/%40reactive-redux%2Fstore)

# Reactive state container

## Install

#### `npm i rxjs ts-action reselect @reactive-redux/store`

## Example

```typescript
import { of, Subject, interval } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  createStore
} from '@reactive-redux/store';
import { action, on, payload, reducer } from "ts-action";

const actionQ = new Subject<AsyncType<ActionsUnion>>();

const increment = action("Increment", payload<{ value: number }>());
const decrement = action("Decrement", payload<{ value: number }>());

interface State {
  value: number;
  }

const initialState: State = {
  value: 0;
};

const initialState$ = of(initialState);
const actionStream$ = actionQ.asObservable();
const reducer$ = of(reducer(
  initialState,
  on(increment, (state, { payload }) => ({ value: state.value + payload.value })),
  on(decrement, (state, { payload }) => ({ value: state.value - payload.value }))
));

const { state$ } = createStore<State, ActionsUnion>({
  actionStream$,
  reducer$,
  initialState$
});

state$.subscribe(console.log);
 
const add1 = increment({ value: 1 });
 
const add1times = n => interval(200).pipe(
  map(() => add1),
  take(n)
);
 
//dispaching an observable action
actionQ.next(add1times(10));
```

## Changelog

## Want to help?
