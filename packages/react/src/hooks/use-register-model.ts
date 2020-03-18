import { useContext, useMemo } from 'react'

import { CaseId } from '@orch/store'
import {
  OrchModel,
  getRegisteredOrch,
  registerModel,
  ModelToOrch,
  ModelState,
  ModelConfig,
} from '@orch/model'

import { StoreContext } from '../store-context'

export type UseRegisterModelConfig<M extends OrchModel<any>> = {
  caseId?: CaseId
  defaultState?: ModelState<M> | ((defaultState: ModelState<M>) => ModelState<M>)
}

function getDefaultState<M extends OrchModel<any>>(
  model: M,
  defaultState: UseRegisterModelConfig<M>['defaultState'],
): ModelState<M> | undefined {
  if (typeof defaultState === 'function') {
    return (defaultState as (defaultState: ModelState<M>) => ModelState<M>)(model.defaultState)
  } else {
    return defaultState
  }
}

export function useRegisterModel<M extends OrchModel<any>>(
  ModelClass: new (...params: any) => M,
  { caseId, defaultState }: UseRegisterModelConfig<M> = {},
): ModelToOrch<M> {
  const model = useMemo(() => ModelConfig.resolveModel(ModelClass), [ModelClass])
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
