import { PerformerAction } from './performer'
import { Namespace, CaseId, NamespaceMap } from './types'
import { DEFAULT_CASE_ID } from './const'
import { Orch } from './orch'
import { serializeNamespaceMap, disposeAllOrches, getOrCreateCaseMap } from './orch-store.utils'

type CommonConfig = {
  namespace: Namespace
  caseId?: CaseId
}

export type RegisterOrchConfig = CommonConfig & {
  orch: Orch<any, any>
}

export class OrchStore {
  private readonly namespaceMap: NamespaceMap = new Map()

  getRegisteredOrch({ namespace, caseId = DEFAULT_CASE_ID }: CommonConfig): Orch<any, any> | null {
    const orch = this.namespaceMap.get(namespace)?.get(caseId)

    return orch instanceof Orch ? orch : null
  }

  dispatch({ namespace, caseId, actionName, payload }: PerformerAction) {
    const orch = this.getRegisteredOrch({ namespace, caseId })
    orch?.actions[actionName]?.(payload)
  }

  registerOrch({ namespace, orch, caseId = DEFAULT_CASE_ID }: RegisterOrchConfig) {
    if (!!this.getRegisteredOrch({ namespace, caseId })) {
      throw new Error(
        `There is already a namespace "${namespace}" with caseId "${caseId}" in store.`,
      )
    }

    const caseMap = getOrCreateCaseMap(this.namespaceMap, namespace)
    const subscription = orch.process$.subscribe((action) => this.dispatch(action))

    caseMap.set(caseId, orch)

    orch.onDispose(() => {
      caseMap.delete(caseId)
      subscription.unsubscribe()
    })
  }

  destroyStore() {
    disposeAllOrches(this.namespaceMap)
    this.namespaceMap.clear()
  }

  toJSON() {
    return serializeNamespaceMap(this.namespaceMap)
  }
}
