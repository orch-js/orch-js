export abstract class Model<S> {
  static namespace: string | null = null

  static createSharedInstance<M>(this: new (...params: any) => M): M {
    if (this.length === 0) {
      return new this()
    } else {
      throw new Error(`Cannot automatically create an instance for model ${Model.name}.`)
    }
  }

  abstract readonly defaultState: S
}
