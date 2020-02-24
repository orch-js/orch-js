import { useContext, useMemo } from 'react'

import { CaseId } from '@orch/store/types'
import { Model, getRegisteredOrch, registerModel, ModelToOrch, ModelState } from '@orch/model'

import { StoreContext } from '../store-context'

export type UseRegisterModel<M extends Model<any>> = {
  caseId?: CaseId
  defaultState?: ModelState<M> | ((defaultState: ModelState<M>) => ModelState<M>)
}

function getDefaultState<M extends Model<any>>(
  model: M,
  defaultState: UseRegisterModel<M>['defaultState'],
): ModelState<M> | undefined {
  if (typeof defaultState === 'function') {
    return (defaultState as (defaultState: ModelState<M>) => ModelState<M>)(model.defaultState)
  } else {
    return defaultState
  }
}

export function useRegisterModel<M extends Model<any>>(
  model: M,
  { caseId, defaultState }: UseRegisterModel<M> = {},
): ModelToOrch<M> {
  const store = useContext(StoreContext)

  return useMemo((): ModelToOrch<M> => {
    const registeredOrch = getRegisteredOrch({ store, model, caseId })

    if (registeredOrch) {
      return registeredOrch
    } else {
      return registerModel({
        store,
        model,
        caseId,
        defaultState: getDefaultState(model, defaultState),
      })
    }
  }, [store, model, caseId])
}
