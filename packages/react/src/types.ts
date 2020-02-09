export type ConstructorType<Instance, Params extends any[]> = new (...params: Params) => Instance

export type ConstructorParams<CT> = CT extends ConstructorType<any, infer Params> ? Params : void
