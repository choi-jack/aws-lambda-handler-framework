import { Metadata, MetadataReflector } from 'class-metadata';
import { Injector, Lifetime, provide, Provider } from 'reflective-dependency-injection';

import { Class } from './class.js';
import { DefaultExecutionContext } from './default-execution-context.js';
import { EntryPoint } from './entry-point.js';
import { Executor } from './executor.js';
import { Handler, HANDLER_OPTIONS, HandlerOptions } from './handler.js';
import { Middleware, MIDDLEWARE_OPTIONS, MiddlewareOptions } from './middleware.js';
import { Context, Event, ExecutionContext } from './parameters.js';
import { ReflectedHandler, ReflectedMiddleware, reflectHandler, reflectMiddleware } from './reflection.js';

function createHandlerProvider(clazz: Class<Handler>): Provider {
    const metadata: Metadata = MetadataReflector.reflect(clazz);
    const options: null | HandlerOptions = metadata.getOwn(HANDLER_OPTIONS);

    if (options === null) {
        throw new Error();
    }

    return provide({
        identifier: clazz,
        useClass: clazz,
        lifetime: options.lifetime ?? Lifetime.SINGLETON,
    });
}

function createMiddlewareProvider(clazz: Class<Middleware>): Provider {
    const metadata: Metadata = MetadataReflector.reflect(clazz);
    const options: null | MiddlewareOptions = metadata.getOwn(MIDDLEWARE_OPTIONS);

    if (options === null) {
        throw new Error();
    }

    return provide({
        identifier: clazz,
        useClass: clazz,
        lifetime: options.lifetime ?? Lifetime.SINGLETON,
    });
}

export interface ApplicationConfiguration {
    readonly handler: Class<Handler>;
    readonly middlewares?: ReadonlyArray<Class<Middleware>>;
    readonly providers?: ReadonlyArray<Provider>;
}

export class Application extends Injector {
    readonly #executor: Executor;
    readonly #handler: ReflectedHandler;
    readonly #middlewares: ReadonlyArray<ReflectedMiddleware>;

    public constructor(configuration: ApplicationConfiguration) {
        const middlewares: ReadonlyArray<Class<Middleware>> = configuration.middlewares ?? [];

        super([
            createHandlerProvider(configuration.handler),
            ...middlewares.map(createMiddlewareProvider),
            ...(configuration.providers ?? []),
        ]);

        this.#executor = new Executor(this);
        this.#handler = reflectHandler(configuration.handler);
        this.#middlewares = middlewares.map(reflectMiddleware);
    }

    public async execute(event: Event, context: Context): Promise<unknown> {
        const executionContext: ExecutionContext = new DefaultExecutionContext(event, context, this.#handler, this.#middlewares);

        return await this.#executor.execute(executionContext);
    }

    public createEntryPoint(): EntryPoint {
        return (event: Event, context: Context): Promise<unknown> => this.execute(event, context);
    }
}
