export abstract class Model<S> {
  static namespace: string | null = null

  abstract readonly defaultState: S
}
