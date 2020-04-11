export type Options = {
  prefix: string
}

export const withDefaultOptions = (options: Partial<Options> = {}): Readonly<Options> => ({
  prefix: 'om',
  ...options,
})
