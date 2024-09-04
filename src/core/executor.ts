import { Injector } from 'reflective-dependency-injection';

import { Handler } from './handler.js';
import { Middleware } from './middleware.js';
import { ExecutionContext, Next, NEXT } from './parameters.js';
import { ReflectedMiddleware, ReflectedParameter } from './reflection.js';

export class Executor {
    public constructor(
        private readonly injector: Injector,
    ) { }

    private resolveArgument(context: ExecutionContext, parameter: ReflectedParameter): unknown {
        if (context.has(parameter.dependency.identifier)) {
            return context.get(parameter.dependency.identifier)!;
        }

        if (parameter.dependency.optional) {
            return undefined;
        }

        throw new Error();
    }

    private resolveArguments(context: ExecutionContext, parameters: ReadonlyArray<ReflectedParameter>): ReadonlyArray<unknown> {
        return parameters.map((parameter: ReflectedParameter): unknown => this.resolveArgument(context, parameter));
    }

    private createMiddlewareExecution(context: ExecutionContext, reflectedMiddleware: ReflectedMiddleware, middleware: Middleware, next: Next): Next {
        return async (): Promise<unknown> => {
            context.set(NEXT, next);

            const args: ReadonlyArray<unknown> = this.resolveArguments(context, reflectedMiddleware.useMethod.parameters);

            // eslint-disable-next-line @typescript-eslint/return-await
            return await middleware.use(...args);
        };
    }

    private createHandlerExecution(context: ExecutionContext, handler: Handler): Next {
        return async (): Promise<unknown> => {
            context.delete(NEXT);

            const args: ReadonlyArray<unknown> = this.resolveArguments(context, context.handler.executeMethod.parameters);

            // eslint-disable-next-line @typescript-eslint/return-await
            return await handler.execute(...args);
        };
    }

    public async execute(context: ExecutionContext): Promise<unknown> {
        const [handler, ...middlewares]: [Handler, ...ReadonlyArray<Middleware>] = await Promise.all([
            this.injector.get(context.handler.type),
            ...context.middlewares.map((middleware: ReflectedMiddleware): Promise<Middleware> => this.injector.get(middleware.type)),
        ]);

        const next: Next = middlewares.reduceRight(
            (next: Next, middleware: Middleware, index: number): Next => this.createMiddlewareExecution(context, context.middlewares[index], middleware, next),
            this.createHandlerExecution(context, handler),
        );

        return await next();
    }
}
