import { fromFetch } from 'rxjs/fetch'
import { endWith, map, startWith, switchMap, takeUntil } from 'rxjs/operators'
import { Model, effect, reducer, action, signal } from '@orch/model'

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
        fromFetch('/resource/list.json').pipe(
          takeUntil(this.cancelFetchData.signal$(caseId)),
          switchMap((data): Promise<ListValue[]> => data.json()),
          map((data) => action(this.updateListData, data)),
          endWith(action(this.updateStatus, HomeStatus.idle)),
          startWith(action(this.updateStatus, HomeStatus.loading)),
        ),
      ),
    ),
  )
}
