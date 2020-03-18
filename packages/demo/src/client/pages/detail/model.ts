import { autoInjectable } from 'tsyringe'
import { OrchModel, effect, reducer, action, signal, ssrAware } from '@orch/model'
import { startWith, switchMap, catchError, endWith, map, takeUntil } from 'rxjs/operators'

import { RxAxios } from '../../utils'
import { DetailData } from './types'

export enum DetailStatus {
  loading = 'loading',
  failed = 'failed',
  idle = 'idle',
}

export type DetailState = {
  status: DetailStatus
  data: DetailData | null
}

@autoInjectable()
export class DetailModel extends OrchModel<DetailState> {
  defaultState: DetailState = {
    status: DetailStatus.idle,
    data: null,
  }

  constructor(private readonly rxAxios: RxAxios) {
    super()
  }

  cancelFetchData = signal()

  fetchData = effect<DetailState, void>(({ payload$, meta }) => {
    const detailId = meta.caseId

    return payload$.pipe(
      switchMap(() =>
        ssrAware(
          this.rxAxios.get<DetailData>(`/resource/${detailId}.json`).pipe(
            takeUntil(this.cancelFetchData.signal$(meta)),
            map((data) => action(this.updateData, data)),
            endWith(action(this.updateStatus, DetailStatus.idle)),
            startWith(action(this.updateStatus, DetailStatus.loading)),
            catchError(() => [action(this.updateStatus, DetailStatus.failed)]),
          ),
        ),
      ),
    )
  })

  private updateStatus = reducer<DetailState, DetailStatus>((state, status) => {
    state.status = status
  })

  private updateData = reducer<DetailState, DetailData>((state, data) => {
    state.data = data
  })
}
