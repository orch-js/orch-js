import { createContext } from 'react'
import { OrchStore } from '@orch/store'

export const StoreContext = createContext(new OrchStore())
