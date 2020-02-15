import { ActionSymbol } from '../symbols'
import { PayloadFunc } from './utils'

export type Action = {
  (): void
  identify: typeof ActionSymbol
}

export type Dispatcher<P> = PayloadFunc<P, void> & {
  asAction: PayloadFunc<P, Action>
}
