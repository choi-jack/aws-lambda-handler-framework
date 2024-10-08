# AWS Lambda Handler Framework

A handler framework for AWS Lambda.

## Getting Started

This package consists of the following packages. For detailed information about each package, see its documentation.

- [class-metadata](https://github.com/choi-jack/class-metadata)
- [reflective-dependency-injection](https://github.com/choi-jack/reflective-dependency-injection)

### Prerequisites

The following versions of Node.js and TypeScript are required:

- Node.js 20 or higher
- TypeScript 4.7 or higher

This package is [pure ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c), and you must configure your project to use the ESM package.

### Installation

#### 1. Install the packages using npm

```sh
npm install aws-lambda-handler-framework
npm install --save-dev @types/aws-lambda
```

#### 2. Set compiler options in your `tsconfig.json` to enable experimental support for stage 2 decorators and metadata

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

## Usage

The following example shows basic usage:

```typescript
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Application, EntryPoint, Event, Handler } from 'aws-lambda-handler-framework';
import { Injectable, provide } from 'aws-lambda-handler-framework/dependency-injection';

@Injectable()
export class GreeterService {
    public greet(greeting: string): string {
        return `Hello, ${greeting}`;
    }
}

@Handler()
export class GreetHandler implements Handler {
    readonly #greeterService: GreeterService;

    public constructor(
        greeterService: GreeterService,
    ) {
        this.#greeterService = greeterService;
    }

    public execute(
        @Event()
        event: APIGatewayProxyEventV2,
    ): APIGatewayProxyResultV2 {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: this.#greeterService.greet(event.queryStringParameters?.greeting ?? 'world!'),
            }),
        };
    }
}

export const application: Application = new Application({
    handler: GreetHandler,
    providers: [
        provide({
            identifier: GreeterService,
            useClass: GreeterService,
        }),
    ],
});

export const handler: EntryPoint = application.createEntryPoint();
```

### Middleware

You can use middleware to extend the functionality of your application.

Middleware is executed before and after the handler. It's like an onion structure.

```typescript
@Middleware()
class ExampleMiddleware implements Middleware {
    public async use(
        @Next()
        next: Next,
    ): Promise<unknown> {
        // before ...

        const result: unknown = await next();

        // after ...

        return result;
    }
}
```

#### Error handling

You can handle errors that occur in handler and middleware with the `try...catch` statement.

```typescript
@Middleware()
class ErrorHandlingMiddleware implements Middleware {
    public async use(
        @Next()
        next: Next,
    ): Promise<unknown> {
        try {
            return await next();
        }
        catch (error) {
            // ...
        }
    }
}
```

#### Early return

If you want to stop the execution flow and return the result immediately, return the result without calling the `next` function.

```typescript
@Middleware()
class CacheMiddleware implements Middleware {
    #cache: unknown;

    public constructor() {
        this.#cache = null;
    }

    public async use(
        @Next()
        next: Next,
    ): Promise<unknown> {
        if (this.#cache !== null) {
            return this.#cache;
        }

        return this.#cache = await next();
    }
}
```

## License

Distributed under the MIT License. See the [LICENSE](https://github.com/choi-jack/aws-lambda-handler-framework/blob/main/LICENSE) file for more details.
