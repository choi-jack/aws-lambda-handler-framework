import { Metadata, MetadataKey, MetadataReflector } from 'class-metadata';
import { Injectable, Lifetime } from 'reflective-dependency-injection';

import { Class } from './class.js';

export interface MiddlewareOptions {
    /**
     * @default Lifetime.SINGLETON
     */
    readonly lifetime?: Lifetime;
}

export const MIDDLEWARE_OPTIONS: MetadataKey<MiddlewareOptions> = new MetadataKey('middleware.options');

export interface Middleware {
    use(...args: ReadonlyArray<any>): unknown;
}

export function Middleware(options: MiddlewareOptions = {}): ClassDecorator {
    return MetadataReflector.createDecorator((metadata: Metadata): void => {
        metadata.set(MIDDLEWARE_OPTIONS, options);

        const clazz: Class<Middleware> = metadata.target as Class<Middleware>;

        Injectable()(clazz);
        Injectable()(clazz.prototype, 'use', Reflect.getOwnPropertyDescriptor(clazz.prototype, 'use')!);
    });
}
