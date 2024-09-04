import { Class } from '../class.js';
import { Middleware } from '../middleware.js';
import { ReflectedClass } from './reflected-class.js';
import { ReflectedMethod } from './reflected-method.js';

export interface ReflectedMiddleware extends ReflectedClass<Class<Middleware>> {
    readonly useMethod: ReflectedMethod;
}
