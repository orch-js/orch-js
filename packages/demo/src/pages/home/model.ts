import { fromFetch } from 'rxjs/fetch'
import { startWith, switchMap } from 'rxjs/operators'
import { Model, effect, reducer } from '@orch/model'

import { ListValue } from './types'

export enum HomeStatus {
  loading = 'loading',
  failed = 'failed',
  idle = 'idle',
}

export type HomeState = {
  status: HomeStatus
  list: ListValue[]
}

export class HomeModel extends Model<HomeState> {
  defaultState = { status: HomeStatus.idle, list: [] }

  private updateStatus = reducer(this)<HomeStatus>((state, status) => {
    state.status = status
  })

  private updateListData = reducer(this)((state, list: ListValue[]) => {
    state.list = list
  })

  fetchData = effect(this)((payload$) =>
    payload$.pipe(
      switchMap(() =>
        fromFetch('/resource/list.json').pipe(
          switchMap((data): Promise<ListValue[]> => data.json()),
          switchMap((data) => [
            this.updateStatus.asAction(HomeStatus.idle),
            this.updateListData.asAction(data),
          ]),
          startWith(this.updateStatus.asAction(HomeStatus.loading)),
        ),
      ),
    ),
  )
}
