import { CaseId } from '../types'
import { Performer, PerformerAction } from './performer'

type ActionInfo = Omit<PerformerAction, 'payload' | 'caseId'>

const performerToPerformerActionMap = new WeakMap<Performer<any, any>, ActionInfo>()

export const registerPerformer = (performer: Performer<any, any>, actionInfo: ActionInfo) => {
  if (!performerToPerformerActionMap.has(performer)) {
    performerToPerformerActionMap.set(performer, actionInfo)
  }
}

export const performerAction = <P>(
  performer: Performer<P, any>,
  payload: P,
  caseId?: CaseId,
): PerformerAction => {
  const actionInfo = performerToPerformerActionMap.get(performer)

  if (actionInfo) {
    return { ...actionInfo, payload, caseId }
  } else {
    const metaInfo = JSON.stringify({ payload, caseId }, null, 2)
    throw new Error(
      `There is no registered performer action for [Performer]: ${performer}\n${metaInfo}`,
    )
  }
}
