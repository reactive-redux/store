import { Action } from "ts-action";

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
