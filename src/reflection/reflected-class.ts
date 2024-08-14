import { Metadata } from 'class-metadata';

import { Class } from '../class.js';

export interface ReflectedClass<Type extends Class> {
    readonly type: Type;
    readonly metadata: Metadata;
}
