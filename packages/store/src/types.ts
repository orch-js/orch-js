import { Orch } from './orch'

export type Namespace = string

export type CaseId = string

export type ActionName = string

type State = object

export type CaseMap = Map<CaseId, Orch<any, any> | State>

export type NamespaceMap = Map<Namespace, CaseMap>

type MapEntries<M> = M extends Map<infer K, infer V>
  ? V extends Map<any, any>
    ? [K, MapEntries<V>][]
    : [K, V][]
  : never

export type SerializedOrchStore = MapEntries<NamespaceMap>
