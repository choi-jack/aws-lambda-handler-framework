import { Class } from '../class.js';
import { Handler } from '../handler.js';
import { ReflectedClass } from './reflected-class.js';
import { ReflectedMethod } from './reflected-method.js';

export interface ReflectedHandler extends ReflectedClass<Class<Handler>> {
    readonly executeMethod: ReflectedMethod;
}
