import { Inject, InjectionToken } from 'reflective-dependency-injection';

export type Event = unknown;

export const EVENT: InjectionToken = new InjectionToken('event');

export function Event(): ParameterDecorator {
    return Inject(EVENT);
}
