import { Metadata } from 'class-metadata';
import { Dependency } from 'reflective-dependency-injection';

export interface ReflectedParameter {
    readonly metadata: Metadata;
    readonly dependency: Dependency;
}
