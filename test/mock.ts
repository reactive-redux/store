import { Action, reducer, on, fsa, action, union } from 'ts-action';

export interface MockState {
  loaded: boolean;
  data: number[];
}

export const MockInitValue: MockState = {
  loaded: false,
  data: [],
};

export enum MockActionsEnum {
  ADD = '[Mock] Add',
  REMOVE = '[Mock] Remove',
}

export const add = action(MockActionsEnum.ADD, fsa<{ number: number }>());
export const remove = action(MockActionsEnum.REMOVE, fsa<{ number: number }>());
export const ActionUnion = union(add, remove);

const compare: (x: number) => (y: number) => boolean = x => y => x === y;

export const MockReducer = reducer(
  MockInitValue,
  on(add, (state, { payload }) => ({ ...state, data: [...state.data, payload.number] })),
  on(remove, (state, { payload }) => ({ ...state, data: state.data.filter(compare(payload.number)) }))
);
