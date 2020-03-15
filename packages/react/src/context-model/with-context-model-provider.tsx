import * as React from 'react'
import { MarkRequired } from 'ts-essentials'

import { Model } from '@orch/model'

import { UseRegisterModelConfig } from '../hooks'
import { useContextModelProvider } from './use-context-model-provider'
import { ModelConstructor } from './model-context'

export function withContextModelProvider<P, M extends Model<any>>(
  Component: React.ComponentType<P>,
  ModelClass: ModelConstructor<M>,
  useRegisterModelConfig: (props: P) => MarkRequired<UseRegisterModelConfig<M>, 'caseId'>,
): React.ComponentType<P> {
  function WrappedComponent(props: P) {
    const config = useRegisterModelConfig(props)
    const ContextModelProvider = useContextModelProvider(ModelClass, config)

    return (
      <ContextModelProvider>
        <Component {...props} />
      </ContextModelProvider>
    )
  }

  WrappedComponent.displayName = Component.displayName

  return WrappedComponent
}
