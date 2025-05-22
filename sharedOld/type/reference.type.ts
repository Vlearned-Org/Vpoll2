export type Reference<T> = string | any;

/**
 * @deprecated Experimental for now
 */
export type Ref<T> = string & { __resource: T };
