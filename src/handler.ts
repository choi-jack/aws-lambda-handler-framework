import { Metadata, MetadataKey, MetadataReflector } from 'class-metadata';
import { Injectable, Lifetime } from 'reflective-dependency-injection';

import { Class } from './class.js';

export interface HandlerOptions {
    readonly lifetime?: Lifetime;
}

export const HANDLER_OPTIONS: MetadataKey<HandlerOptions> = new MetadataKey('handler.options');

export interface Handler {
    execute(...args: ReadonlyArray<any>): unknown;
}

export function Handler(options: HandlerOptions = {}): ClassDecorator {
    return MetadataReflector.createDecorator((metadata: Metadata): void => {
        metadata.set(HANDLER_OPTIONS, options);

        const handler: Class<Handler> = metadata.target as Class<Handler>;

        Injectable()(handler);
        Injectable()(handler.prototype, 'execute', Reflect.getOwnPropertyDescriptor(handler.prototype, 'execute')!);
    });
}
