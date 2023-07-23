import { endWith, map, startWith, switchMap, takeUntil } from 'rxjs/operators'
import { OrchModel, effect, reducer, action, signal } from '@orch/model'

import { rxAxios } from '@/utils'

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

  fetchData = effect<void>((payload$) =>
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

  private updateStatus = reducer(this, (state, status: HomeStatus) => {
    state.status = status
  })

  private updateListData = reducer(this, (state, list: ListValue[]) => {
    state.list = list
  })
}
