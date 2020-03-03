import { endWith, map, startWith, switchMap, takeUntil } from 'rxjs/operators'
import { Model, effect, reducer, action, signal } from '@orch/model'

import { RxAxios } from '../../utils'
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
  defaultState: HomeState = { status: HomeStatus.idle, list: [] }

  cancelFetchData = signal()

  private updateStatus = reducer<HomeState, HomeStatus>((state, status) => {
    state.status = status
  })

  private updateListData = reducer<HomeState, ListValue[]>((state, list) => {
    state.list = list
  })

  fetchData = effect((payload$, _, caseId) =>
    payload$.pipe(
      switchMap(() =>
        RxAxios.get<ListValue[]>('/resource/list.json').pipe(
          takeUntil(this.cancelFetchData.signal$(caseId)),
          map((data) => action(this.updateListData, data)),
          endWith(action(this.updateStatus, HomeStatus.idle)),
          startWith(action(this.updateStatus, HomeStatus.loading)),
        ),
      ),
    ),
  )
}
