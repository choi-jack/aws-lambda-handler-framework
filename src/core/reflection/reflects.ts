import { MetadataReflector } from 'class-metadata';
import { Dependency, DependencyReflector } from 'reflective-dependency-injection';

import { Class } from '../class.js';
import { Handler } from '../handler.js';
import { Middleware } from '../middleware.js';
import { ReflectedHandler } from './reflected-handler.js';
import { ReflectedMethod } from './reflected-method.js';
import { ReflectedMiddleware } from './reflected-middleware.js';
import { ReflectedParameter } from './reflected-parameter.js';

function reflectMethod(target: object, propertyKey: string): ReflectedMethod {
    const dependencies: ReadonlyArray<Dependency> = DependencyReflector.getOwnDependencies(target, propertyKey) ?? [];
    const parameters: ReadonlyArray<ReflectedParameter> = dependencies.map((dependency: Dependency, index: number): ReflectedParameter => {
        return {
            metadata: MetadataReflector.reflect(target, propertyKey, index),
            dependency,
        };
    });

    return {
        metadata: MetadataReflector.reflect(target, propertyKey),
        parameters,
    };
}

export function reflectHandler(type: Class<Handler>): ReflectedHandler {
    return {
        type,
        metadata: MetadataReflector.reflect(type),
        executeMethod: reflectMethod(type.prototype, 'execute'),
    };
}

export function reflectMiddleware(type: Class<Middleware>): ReflectedMiddleware {
    return {
        type,
        metadata: MetadataReflector.reflect(type),
        useMethod: reflectMethod(type.prototype, 'use'),
    };
}
