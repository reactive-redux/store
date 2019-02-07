import { IAction } from './interfaces';
export declare class Action implements IAction {
    payload?: unknown;
    constructor(payload?: unknown);
    readonly type: string;
}
