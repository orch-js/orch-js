import { catchError, filter, map, startWith, switchMap, takeUntil } from 'rxjs/operators'
import { MarkOptional } from 'ts-essentials'

import { epic, OrchModel, signal } from '@orch/core'

import { rxAxios } from '@/utils'

import { DetailData } from './types'

type Status<S, D = unknown> = { status: S } & D

export type DetailState = {
  detailId: string
  detail: Status<'loading' | 'failed'> | Status<'success', DetailData>
}

export class DetailModel extends OrchModel<DetailState> {
  get needFetchData() {
    return this.state.detail.status !== 'success'
  }

  constructor(defaultState: MarkOptional<DetailState, 'detail'>) {
    super({ detail: { status: 'loading' }, ...defaultState })

    this.fetchData()
  }

  cancelFetchData = signal()

  fetchData = epic<void>(({ payload$, action }) => {
    const updateDetail = this.reducer((state, detail: DetailState['detail']) => {
      state.detail = detail
    })

    return payload$.pipe(
      filter(() => this.needFetchData),
      switchMap(() =>
        rxAxios.get<DetailData>(`/resource/${this.state.detailId}.json`).pipe(
          takeUntil(this.cancelFetchData.signal$),
          map((data) => action(updateDetail, { status: 'success', ...data })),
          startWith(action(updateDetail, { status: 'loading' })),
          catchError(() => [action(updateDetail, { status: 'failed' })]),
        ),
      ),
    )
  })
}
