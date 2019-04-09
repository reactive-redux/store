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
  createStore
} from '@reactive-redux/store';

//Counter example
type State = number;
 
class Increment extends Action {}
 
class Decrement extends Action {}
 
type ActionsUnion = Increment | Decrement;
 
const actionQ = new Subject<AsyncType<ActionsUnion>>();
 
const initialState = 0;
 
const increment = (state: State, action: Increment) => state + 1;
 
const decrement = (state: State, action: Decrement) => state - 1;
 
const initialState$ = of(initialState);
const actionStream$ = actionQ.asObservable();
const reducers$ = of([increment, decrement]);
 
const { state$ } = createStore<State, ActionsUnion>({
  actionStream$,
  reducers$,
  initialState$
});

state$.subscribe(console.log);
 
const add1 = new Increment();
 
const add1times = n => interval(200).pipe(
  map(() => add1),
  take(n)
);
 
//dispaching an observable action
actionQ.next(add1times(10));
```

## Changelog

## Want to help?
