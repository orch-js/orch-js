import { endWith, map, startWith, switchMap, takeUntil } from 'rxjs/operators'
import { OrchModel, effect, reducer, action, signal, ssrAware } from '@orch/model'
import { autoInjectable } from 'tsyringe'

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

@autoInjectable()
export class HomeModel extends OrchModel<HomeState> {
  defaultState: HomeState = {
    status: HomeStatus.idle,
    list: [],
  }

  constructor(private readonly rxAxios: RxAxios) {
    super()
  }

  cancelFetchData = signal()

  fetchData = effect<HomeState, void>(({ payload$, meta }) =>
    payload$.pipe(
      switchMap(() =>
        ssrAware(
          this.rxAxios.get<ListValue[]>('/resource/list.json').pipe(
            takeUntil(this.cancelFetchData.signal$(meta)),
            map((data) => action(this.updateListData, data)),
            endWith(action(this.updateStatus, HomeStatus.idle)),
            startWith(action(this.updateStatus, HomeStatus.loading)),
          ),
        ),
      ),
    ),
  )

  private updateStatus = reducer<HomeState, HomeStatus>((state, status) => {
    state.status = status
  })

  private updateListData = reducer<HomeState, ListValue[]>((state, list) => {
    state.list = list
  })
}
