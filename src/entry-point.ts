import { Context, Event } from './parameters.js';

export type EntryPoint = (event: Event, context: Context) => Promise<unknown>;
