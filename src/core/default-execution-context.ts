import { InjectionToken } from 'reflective-dependency-injection';

import { CONTEXT, Context, EVENT, Event, EXECUTION_CONTEXT, ExecutionContext } from './parameters.js';
import { ReflectedHandler, ReflectedMiddleware } from './reflection.js';

export class DefaultExecutionContext implements ExecutionContext {
    readonly #map: Map<InjectionToken, unknown>;

    public constructor(
        public readonly event: Event,
        public readonly context: Context,
        public readonly handler: ReflectedHandler,
        public readonly middlewares: ReadonlyArray<ReflectedMiddleware>,
    ) {
        this.#map = new Map();

        this.set(EXECUTION_CONTEXT, this);

        this.set(EVENT, event);
        this.set(CONTEXT, context);
    }

    public has(token: InjectionToken): boolean {
        return this.#map.has(token);
    }

    public get<T>(token: InjectionToken<T>): null | T {
        if (this.has(token)) {
            return this.#map.get(token)! as T;
        }

        return null;
    }

    public set<T>(token: InjectionToken<T>, value: NoInfer<T>): void {
        this.#map.set(token, value);
    }

    public delete(token: InjectionToken): void {
        this.#map.delete(token);
    }
}
