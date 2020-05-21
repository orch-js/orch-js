import * as React from 'react'

import { OrchModel } from '@orch/model'

import { useContextModelProvider } from './use-context-model-provider'
import { ModelConstructor } from './model-context'

export function withContextModelProvider<P, M extends OrchModel<any>>(
  Component: React.ComponentType<P>,
  ModelClass: ModelConstructor<M>,
  useGetModel: (props: P) => M,
): React.ComponentType<P> {
  function WrappedComponent(props: P) {
    const model = useGetModel(props)
    const ContextModelProvider = useContextModelProvider(ModelClass, model)

    return (
      <ContextModelProvider>
        <Component {...props} />
      </ContextModelProvider>
    )
  }

  WrappedComponent.displayName = Component.displayName

  return WrappedComponent
}
