import { Injector } from 'reflective-dependency-injection';

import { Handler } from './handler.js';
import { ExecutionContext } from './parameters.js';
import { ReflectedParameter } from './reflection.js';

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

    public async execute(context: ExecutionContext): Promise<unknown> {
        const handler: Handler = await this.injector.get(context.handler.type);
        const args: ReadonlyArray<unknown> = this.resolveArguments(context, context.handler.executeMethod.parameters);

        // eslint-disable-next-line @typescript-eslint/return-await
        return await handler.execute(...args);
    }
}
