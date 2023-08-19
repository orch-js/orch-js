import { endWith, map, startWith, switchMap, takeUntil } from 'rxjs/operators'

import { epic, mutation, OrchModel, signal } from '@orch/core'

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
  get hasData() {
    return this.getState().list.length > 0
  }

  cancelFetchData = signal(this)

  fetchData = epic(this, ({ payload$, action }) =>
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

  private updateStatus = mutation(this, (state, status: HomeStatus) => {
    state.status = status
  })

  private updateListData = mutation(this, (state, list: ListValue[]) => {
    state.list = list
  })
}
