import {
  startWith,
  switchMap,
  catchError,
  endWith,
  map,
  withLatestFrom,
  filter,
  takeUntil,
} from 'rxjs/operators'
import { Model, effect, reducer, action, signal, ssrAware } from '@orch/model'
import { autoInjectable } from 'tsyringe'

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
  detailId: string | null
}

@autoInjectable()
export class DetailModel extends Model<DetailState> {
  defaultState: DetailState = { detailId: null, status: DetailStatus.idle, data: null }

  cancelFetchData = signal()

  constructor(private readonly rxAxios: RxAxios) {
    super()
  }

  private updateStatus = reducer<DetailState, DetailStatus>((state, status) => {
    state.status = status
  })

  private updateData = reducer<DetailState, DetailData>((state, data) => {
    state.data = data
  })

  fetchData = effect<void, DetailState>((payload$, state$, caseId) =>
    payload$.pipe(
      withLatestFrom(state$),
      map(([, { detailId }]) => detailId),
      filter(<T>(detailId: T): detailId is NonNullable<T> => !!detailId),
      switchMap((detailId) =>
        ssrAware(
          this.rxAxios.get<DetailData>(`/resource/${detailId}.json`).pipe(
            takeUntil(this.cancelFetchData.signal$(caseId)),
            map((data) => action(this.updateData, data)),
            endWith(action(this.updateStatus, DetailStatus.idle)),
            startWith(action(this.updateStatus, DetailStatus.loading)),
            catchError(() => [action(this.updateStatus, DetailStatus.failed)]),
          ),
        ),
      ),
    ),
  )
}
