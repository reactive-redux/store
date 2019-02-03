import { IAction } from './interfaces';
export declare abstract class Action implements IAction {
    payload?: unknown;
    readonly type: string;
    constructor(payload?: unknown);
}
