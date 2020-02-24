import { Orch } from './orch'

import { Namespace, CaseId } from './types'
import { PerformerAction } from './performer'
import { DEFAULT_CASE_ID } from './const'

type CommonConfig = {
  namespace: Namespace
  caseId?: CaseId
}

export type RegisterOrchConfig = CommonConfig & {
  orch: Orch<any, any>
}

export class OrchStore {
  private orchMap = new Map<Namespace, Map<CaseId, Orch<any, any>>>()

  dispatch({ namespace, actionName, payload, caseId = DEFAULT_CASE_ID }: PerformerAction) {
    const orch = this.orchMap.get(namespace)?.get(caseId)
    orch?.actions[actionName]?.(payload)
  }

  getRegisteredOrch({ namespace, caseId = DEFAULT_CASE_ID }: CommonConfig) {
    return this.orchMap.get(namespace)?.get(caseId)
  }

  registerOrch({ namespace, orch, caseId = DEFAULT_CASE_ID }: RegisterOrchConfig) {
    if (this.orchMap.get(namespace)?.has(caseId)) {
      throw new Error(
        `There is already a namespace "${namespace}" with caseId "${caseId}" in store.`,
      )
    }

    const caseMap = this.getOrCreateCaseMap(namespace)
    const subscription = orch.process$.subscribe((action) => this.dispatch(action))

    caseMap.set(caseId, orch)

    orch.onDispose(() => {
      caseMap.delete(caseId)
      subscription.unsubscribe()
    })
  }

  destroyStore() {
    this.orchMap.forEach((caseMap) => {
      caseMap.forEach((orch) => {
        orch.dispose()
      })
    })
  }

  private getOrCreateCaseMap(namespace: Namespace): Map<CaseId, Orch<any, any>> {
    const caseMap = this.orchMap.get(namespace)

    if (caseMap) {
      return caseMap
    } else {
      const newCaseMap = new Map<CaseId, Orch<any, any>>()
      this.orchMap.set(namespace, newCaseMap)
      return newCaseMap
    }
  }
}
