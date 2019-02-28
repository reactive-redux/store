import { IAction } from './interfaces';
import { OperatorFunction } from 'rxjs';
export declare class Action implements IAction {
    payload?: unknown;
    constructor(payload?: unknown);
    readonly type: string;
}
export declare function ofType<T extends IAction>(...allowedTypes: string[]): OperatorFunction<IAction, T>;
