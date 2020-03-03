import { PerformerAction } from './performer'
import { Namespace, CaseId, NamespaceMap, SerializedOrchStore } from './types'
import { DEFAULT_CASE_ID } from './const'
import { Orch } from './orch'
import { SsrWaitingGroup } from './ssr-waiting-group'
import {
  serializeNamespaceMap,
  deserializeNamespaceMap,
  disposeAllOrches,
  getOrCreateCaseMap,
} from './orch-store.utils'

type CommonConfig = {
  namespace: Namespace
  caseId?: CaseId
}

export type OrchStoreInitConfig = {
  serializedOrchStore?: SerializedOrchStore
  enableSsrWaitingGroup?: boolean
}

export type RegisterOrchConfig = CommonConfig & {
  createOrch: (ssrState: any) => Orch<any, any>
}

export class OrchStore {
  private readonly namespaceMap: NamespaceMap = new Map()

  readonly ssrWaitingGroup: SsrWaitingGroup

  constructor({ serializedOrchStore, enableSsrWaitingGroup }: OrchStoreInitConfig = {}) {
    this.namespaceMap = serializedOrchStore
      ? deserializeNamespaceMap(serializedOrchStore)
      : new Map()

    this.ssrWaitingGroup = new SsrWaitingGroup(!!enableSsrWaitingGroup)
  }

  getRegisteredOrch({ namespace, caseId = DEFAULT_CASE_ID }: CommonConfig): Orch<any, any> | null {
    const orch = this.namespaceMap.get(namespace)?.get(caseId)

    return orch instanceof Orch ? orch : null
  }

  dispatch({ namespace, caseId, actionName, payload }: PerformerAction) {
    const orch = this.getRegisteredOrch({ namespace, caseId })
    orch?.actions[actionName]?.(payload)
  }

  registerOrch({
    namespace,
    createOrch,
    caseId = DEFAULT_CASE_ID,
  }: RegisterOrchConfig): Orch<any, any> {
    if (!!this.getRegisteredOrch({ namespace, caseId })) {
      throw new Error(
        `There is already a namespace "${namespace}" with caseId "${caseId}" in store.`,
      )
    }

    const ssrState = this.getSsrState({ namespace, caseId })
    const orch = createOrch(ssrState)
    const caseMap = getOrCreateCaseMap(this.namespaceMap, namespace)
    const subscription = orch.process$.subscribe((action) => this.dispatch(action))

    caseMap.set(caseId, orch)

    orch.onDispose(() => {
      caseMap.delete(caseId)
      subscription.unsubscribe()
    })

    return orch
  }

  destroyStore() {
    disposeAllOrches(this.namespaceMap)
    this.namespaceMap.clear()
  }

  toJSON() {
    return serializeNamespaceMap(this.namespaceMap)
  }

  private getSsrState({ namespace, caseId = DEFAULT_CASE_ID }: CommonConfig): object | null {
    const orch = this.namespaceMap.get(namespace)?.get(caseId) ?? null

    return orch instanceof Orch ? null : orch
  }
}
