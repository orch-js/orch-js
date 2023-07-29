import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators'

import { epic, OrchModel, signal } from '@orch/core'

import { rxAxios } from '@/utils'

import { DetailData } from './types'

export type DetailState = {
  detail:
    | {
        status: 'loading'
      }
    | {
        status: 'failed'
      }
    | (DetailData & {
        status: 'success'
      })
}

export class DetailModel extends OrchModel<DetailState> {
  get needFetchData() {
    return this.state.detail.status !== 'success'
  }

  constructor(
    public readonly detailId: string,
    defaultState: DetailState = { detail: { status: 'loading' } },
  ) {
    super(defaultState)
  }

  cancelFetchData = signal()

  fetchData = epic<void>(({ payload$, action }) => {
    return payload$.pipe(
      switchMap(() =>
        rxAxios.get<DetailData>(`/resource/${this.detailId}.json`).pipe(
          takeUntil(this.cancelFetchData.signal$),
          map((data) => action(this.updateDetail, { status: 'success', ...data })),
          startWith(action(this.updateDetail, { status: 'loading' })),
          catchError(() => [action(this.updateDetail, { status: 'failed' })]),
        ),
      ),
    )
  })

  private updateDetail = this.reducer((state, detail: DetailState['detail']) => {
    state.detail = detail
  })
}
