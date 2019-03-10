import { ActionMap } from '../src/interfaces';
import { Action } from 'src/action';

export interface MockState {
  loaded: boolean;
  data?: number[];
}

export const mockInitValue: MockState = {
  loaded: false
};

export enum MockActionsEnum {
  ADD = '[Mock] Add',
  REMOVE = '[Mock] Remove'
}

export class MockAdd implements Action {
  readonly type = MockActionsEnum.ADD;

  constructor(public payload: number) {}
}

export class MockRemove implements Action {
  readonly type = MockActionsEnum.REMOVE;

  constructor(public payload: number) {}
}

export type MockActionsUnion = MockAdd | MockRemove;

const add = (state: MockState, action: any) => ({
  ...state,
  data: [...(state.data || []), action.payload]
});

const remove = (state: MockState, action: any) => ({
  ...state,
  data: state.data ? state.data.filter(v => v !== action.payload) : []
});

export const mockReducerMap: ActionMap<MockState> = {
  [MockActionsEnum.ADD]: add,
  [MockActionsEnum.REMOVE]: remove
};
