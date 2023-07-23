import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators'

import { action, effect, OrchModel, reducer, signal } from '@orch/model'

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
  constructor(public readonly detailId: string) {
    super({
      detail: { status: 'loading' },
    })
  }

  cancelFetchData = signal()

  fetchData = effect<void>((payload$) => {
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

  private updateDetail = reducer(this, (state, detail: DetailState['detail']) => {
    state.detail = detail
  })
}