export abstract class OrchModel<S> {
  static namespace: string | null = null

  abstract readonly defaultState: S
}
