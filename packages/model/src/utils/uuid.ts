type Prefix = string
type Id = number

const cache: Partial<Record<Prefix, Id>> = {}

export function uuid(prefix: string) {
  const newId = (cache[prefix] ?? 0) + 1

  cache[prefix] = newId

  return `${prefix}-${newId}`
}
