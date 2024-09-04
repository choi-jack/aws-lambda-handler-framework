import { Inject, InjectionToken } from 'reflective-dependency-injection';

export type Next = () => Promise<unknown>;

export const NEXT: InjectionToken<Next> = new InjectionToken('next');

export function Next(): ParameterDecorator {
    return Inject(NEXT);
}
