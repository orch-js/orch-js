export function ignoreConsole() {
  const consoleSpy = (['log', 'error', 'group', 'groupEnd'] as const).map((key) =>
    jest.spyOn(console, key).mockImplementation(),
  )

  return () => consoleSpy.forEach((spy) => spy.mockRestore())
}
