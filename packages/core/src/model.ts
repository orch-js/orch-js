type Model<State, Actions, Views> = {
  state: State
  actions: Actions
  views: Views
  destroy: () => void
}

type ActionFactory<NewActions, State, Actions, Views> = (
  self: Model<State, Actions, Views>,
) => NewActions

type ViewsFactory<NewViews, State, Views> = (self: Model<State, unknown, Views>) => NewViews

interface ModelBuilder<State, Actions = unknown, Views = unknown> {
  actions<NewActions>(
    factory: ActionFactory<NewActions, State, Actions, Views>,
  ): ModelBuilder<State, Actions & NewActions, Views>

  views<NewViews>(
    factory: ViewsFactory<NewViews, State, Views>,
  ): ModelBuilder<State, Actions, Views & NewViews>

  create(state: State): Model<State, Actions, Views>
}

export function defineModel<S>(): ModelBuilder<S> {}

const CountModel = defineModel<{ count: number }>()
  .actions((self) => ({
    add() {
      self.state.count
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
      return `${self.state.count}`
    },
  }))

CountModel.create({ count: 1 }).actions.add()

CountModel.create({ count: 2 }).views.countStr
