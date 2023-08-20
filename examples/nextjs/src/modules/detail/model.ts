import { catchError, filter, map, startWith, switchMap } from 'rxjs/operators'
import { MarkOptional } from 'ts-essentials'

import { epic, mutation, OrchModel } from '@orch/core'

import { rxAxios } from '@/utils'

import { DetailData } from './types'

type Status<S, D = unknown> = { status: S } & D

export type DetailState = {
  detailId: string
  detail: Status<'loading' | 'failed'> | Status<'success', DetailData>
}

export class DetailModel extends OrchModel<DetailState> {
  get needFetchData() {
    return this.getState().detail.status !== 'success'
  }

  constructor(defaultState: MarkOptional<DetailState, 'detail'>) {
    super({ detail: { status: 'loading' }, ...defaultState })

    this.on.activate(this.fetchData)
  }

  fetchData = epic(this, ({ payload$, action }) => {
    const updateDetail = mutation(this, (state, detail: DetailState['detail']) => {
      state.detail = detail
    })

    return payload$.pipe(
      filter(() => this.needFetchData),
      switchMap(() =>
        rxAxios.get<DetailData>(`/resource/${this.getState().detailId}.json`).pipe(
          map((data) => action(updateDetail, { status: 'success', ...data })),
          startWith(action(updateDetail, { status: 'loading' })),
          catchError(() => [action(updateDetail, { status: 'failed' })]),
        ),
      ),
    )
  })
}
