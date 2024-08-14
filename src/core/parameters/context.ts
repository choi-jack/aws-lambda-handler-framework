import { Context as LambdaContext } from 'aws-lambda';
import { Inject, InjectionToken } from 'reflective-dependency-injection';

export type Context = LambdaContext;

export const CONTEXT: InjectionToken<Context> = new InjectionToken('context');

export function Context(): ParameterDecorator {
    return Inject(CONTEXT);
}
