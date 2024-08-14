import { Metadata } from 'class-metadata';

import { ReflectedParameter } from './reflected-parameter.js';

export interface ReflectedMethod {
    readonly metadata: Metadata;
    readonly parameters: ReadonlyArray<ReflectedParameter>;
}
