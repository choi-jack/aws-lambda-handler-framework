import { Identifier, Inject, InjectionToken } from 'reflective-dependency-injection';

import { ReflectedHandler } from '../reflection.js';
import { Context } from './context.js';
import { Event } from './event.js';

export interface ExecutionContext {
    readonly event: Event;
    readonly context: Context;

    readonly handler: ReflectedHandler;

    has(identifier: Identifier): boolean;
    get<T>(identifier: Identifier<T>): null | T;
    set<T>(identifier: Identifier<T>, value: NoInfer<T>): void;
    delete(identifier: Identifier): void;
}

export const EXECUTION_CONTEXT: InjectionToken<ExecutionContext> = new InjectionToken('execution-context');

export function ExecutionContext(): ParameterDecorator {
    return Inject(EXECUTION_CONTEXT);
}
