import { endWith, map, startWith, switchMap, takeUntil } from 'rxjs/operators'
import { OrchModel, effect, reducer, action, signal } from '@orch/model'

import { rxAxios } from '@orch/demo/utils'

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

export class HomeModel extends OrchModel<HomeState> {
  cancelFetchData = signal()

  fetchData = effect<void, HomeState>(({ payload$ }) =>
    payload$.pipe(
      switchMap(() =>
        rxAxios.get<ListValue[]>('/resource/list.json').pipe(
          takeUntil(this.cancelFetchData.signal$),
          map((data) => action(this.updateListData, data)),
          endWith(action(this.updateStatus, HomeStatus.idle)),
          startWith(action(this.updateStatus, HomeStatus.loading)),
        ),
      ),
    ),
  )

  private updateStatus = reducer<HomeStatus, HomeState>(({ state, payload }) => {
    state.status = payload
  })

  private updateListData = reducer<ListValue[], HomeState>(({ state, payload }) => {
    state.list = payload
  })
}
