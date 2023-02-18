type Model<State, Actions, Views> = {
  actions: Actions
  getState: () => State & Views
  destroy: () => void
}

type ActionFactory<NewActions, State, Actions, Views> = (
  self: Model<State, Actions, Views>,
) => NewActions

type ViewsFactory<NewViews, State, Views> = (self: Model<State, unknown, Views>) => NewViews

type CreateFn<HasDefaultState extends boolean, State, Actions, Views> = HasDefaultState extends true
  ? (defaultState?: Partial<State>) => Model<State, Actions, Views>
  : (defaultState: State) => Model<State, Actions, Views>

interface ModelBuilder<HasDefaultState extends boolean, State, Actions = unknown, Views = unknown> {
  actions<NewActions>(
    factory: ActionFactory<NewActions, State, Actions, Views>,
  ): ModelBuilder<HasDefaultState, State, Actions & NewActions, Views>

  views<NewViews>(
    factory: ViewsFactory<NewViews, State, Views>,
  ): ModelBuilder<HasDefaultState, State, Actions, Views & NewViews>

  create: CreateFn<HasDefaultState, State, Actions, Views>
}

export function defineModel<S>(defaultState: S): ModelBuilder<true, S>
export function defineModel<S>(): ModelBuilder<false, S>
export function defineModel<S>(_defaultState?: S): ModelBuilder<boolean, S> {}

const CountModel = defineModel<{ count: number }>({ count: 3 })
  .actions((self) => ({
    add() {
      self.getState().count
    },

    add2() {
      this.add2()
    },
  }))
  .actions((self) => ({
    remove() {
      self.actions.add()
    },
  }))
  .views((self) => ({
    get countStr() {
      return `${self.getState().count}`
    },
  }))

CountModel.create().actions.add()

CountModel.create({ count: 2 }).getState().countStr
