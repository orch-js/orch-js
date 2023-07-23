import { vi } from 'vitest'

export function ignoreConsole() {
  const consoleSpy = (['log', 'error', 'group', 'groupEnd'] as const).map((key) =>
    vi.spyOn(console, key).mockImplementation(() => {}),
  )

  return () => consoleSpy.forEach((spy) => spy.mockRestore())
}
