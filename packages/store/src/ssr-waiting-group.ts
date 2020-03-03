export enum WaitingResult {
  allSucceeded = 'allSucceeded',
  timeout = 'timeout',
}

export class SsrWaitingGroup {
  private group: Promise<void>[] = []

  constructor(public readonly enabled: boolean) {}

  push(signal: Promise<void>) {
    if (this.enabled) {
      this.group.push(signal)
    }
  }

  waitUntil(timeout: number): Promise<WaitingResult> {
    if (!this.enabled) {
      throw new Error('SsrWaitingGroup is not enabled')
    }

    const groupPromise = Promise.all(this.group).then(() => {
      return WaitingResult.allSucceeded
    })

    const timeoutPromise = new Promise<WaitingResult>((resolve) => {
      setTimeout(() => resolve(WaitingResult.timeout), timeout)
    })

    this.group = []

    return Promise.race([groupPromise, timeoutPromise])
  }

  isEmpty() {
    return this.group.length === 0
  }
}
