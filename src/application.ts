import { Metadata, MetadataReflector } from 'class-metadata';
import { Injector, Lifetime, provide, Provider } from 'reflective-dependency-injection';

import { Class } from './class.js';
import { DefaultExecutionContext } from './default-execution-context.js';
import { EntryPoint } from './entry-point.js';
import { Executor } from './executor.js';
import { Handler, HANDLER_OPTIONS, HandlerOptions } from './handler.js';
import { Context, Event, ExecutionContext } from './parameters.js';
import { ReflectedHandler, reflectHandler } from './reflection.js';

function createHandlerProvider(handler: Class<Handler>): Provider {
    const metadata: Metadata = MetadataReflector.reflect(handler);
    const options: null | HandlerOptions = metadata.getOwn(HANDLER_OPTIONS);

    if (options === null) {
        throw new Error();
    }

    return provide({
        identifier: handler,
        useClass: handler,
        lifetime: options.lifetime ?? Lifetime.SINGLETON,
    });
}

export interface ApplicationConfiguration {
    readonly handler: Class<Handler>;
    readonly providers?: ReadonlyArray<Provider>;
}

export class Application extends Injector {
    #executor: Executor;
    #handler: ReflectedHandler;

    public constructor(configuration: ApplicationConfiguration) {
        super([
            ...(configuration.providers ?? []),
            createHandlerProvider(configuration.handler),
        ]);

        this.#executor = new Executor(this);
        this.#handler = reflectHandler(configuration.handler);
    }

    async #execute(event: Event, context: Context): Promise<unknown> {
        const executionContext: ExecutionContext = new DefaultExecutionContext(event, context, this.#handler);

        try {
            const result: unknown = await this.#executor.execute(executionContext);

            return this.handleResult(result, executionContext);
        }
        catch (error) {
            return this.handleError(error, executionContext);
        }
    }

    protected handleError(error: unknown, _context: ExecutionContext): unknown {
        throw error;
    }

    protected handleResult(result: unknown, _context: ExecutionContext): unknown {
        return result;
    }

    public async execute(event: Event, context: Context): Promise<unknown> {
        return await this.#execute(event, context);
    }

    public createEntryPoint(): EntryPoint {
        return (event: Event, context: Context): Promise<unknown> => this.execute(event, context);
    }
}
