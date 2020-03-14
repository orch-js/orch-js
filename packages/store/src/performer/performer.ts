import { Observable, Subject } from 'rxjs'
import * as shallowequal from 'shallowequal'

import { OrchState } from '../orch-state'
import { OrchStore } from '../orch-store'
import { Namespace, CaseId, ActionName } from '../types'
import { DEFAULT_CASE_ID } from '../const'

export type PerformerAction = {
  namespace: Namespace
  caseId: CaseId | undefined
  actionName: ActionName
  payload: any
}

export type PerformerFactoryMeta = {
  caseId?: CaseId
  namespace: Namespace
  store: OrchStore
}

export type PerformerFactory<P, S> = (
  payload$: Observable<P>,
  orchState: OrchState<S>,
  meta: Required<PerformerFactoryMeta>,
) => Observable<PerformerAction>

export type PerformerRecordResult<P> = {
  action: (payload: P) => void
  process$: Observable<PerformerAction>
}

export class Performer<P, S> {
  static isIdenticalMeta(metaA: PerformerFactoryMeta, metaB: PerformerFactoryMeta) {
    return shallowequal(metaA, metaB)
  }

  constructor(private readonly factory: PerformerFactory<P, S>) {}

  record(
    orchState: OrchState<S>,
    { caseId = DEFAULT_CASE_ID, ...meta }: PerformerFactoryMeta,
  ): PerformerRecordResult<P> {
    const payloadSource = new Subject<P>()
    const process$ = this.factory(payloadSource.asObservable(), orchState, { caseId, ...meta })

    orchState.onDispose(() => {
      payloadSource.complete()
    })

    return {
      process$,
      action(payload) {
        payloadSource.next(payload)
      },
    }
  }

  toString() {
    return this.factory.toString()
  }
}
