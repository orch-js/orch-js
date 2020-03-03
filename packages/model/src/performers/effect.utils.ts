import { map } from 'rxjs/operators'
import { PerformerAction } from '@orch/store'

export function nonNullable<T>(input: T): input is NonNullable<T> {
  return input !== null
}

export function addCaseIdIfIsCurrentModelAction({
  namespace,
  caseId,
}: {
  namespace: string
  caseId: string
}) {
  return map(
    (action: PerformerAction): PerformerAction => {
      const isCurrentModelAction = action.namespace === namespace

      if (isCurrentModelAction) {
        return { ...action, caseId: action.caseId ?? caseId }
      } else {
        return action
      }
    },
  )
}
