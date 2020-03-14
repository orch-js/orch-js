import { Orch } from './orch'
import { CaseId, CaseMap, Namespace, NamespaceMap, SerializedOrchStore } from './types'

export function deserializeNamespaceMap(namespaceMapEntries: SerializedOrchStore): NamespaceMap {
  return new Map(
    namespaceMapEntries.map(([namespace, caseMapEntries]) => [namespace, new Map(caseMapEntries)]),
  )
}

export function serializeNamespaceMap(namespaceMap: NamespaceMap): SerializedOrchStore {
  return Array.from(namespaceMap.entries()).map(([namespace, caseMap]) => [
    namespace,
    Array.from(caseMap.entries()).map(([caseId, orch]) => [
      caseId,
      orch instanceof Orch ? orch.state.getState() : orch,
    ]),
  ])
}

export function disposeAllOrches(namespaceMap: NamespaceMap) {
  namespaceMap.forEach((caseMap) => {
    caseMap.forEach((orch) => {
      if (orch instanceof Orch) {
        orch.dispose()
      }
    })
  })
}

export function getOrCreateCaseMap(namespaceMap: NamespaceMap, namespace: Namespace): CaseMap {
  const caseMap = namespaceMap.get(namespace)

  if (caseMap) {
    return caseMap
  } else {
    const newCaseMap = new Map<CaseId, Orch<any, any>>()
    namespaceMap.set(namespace, newCaseMap)
    return newCaseMap
  }
}
