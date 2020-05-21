import { OrchModel, effect, reducer, action, signal, ssrAware } from '@orch/model'
import { startWith, switchMap, catchError, map, takeUntil } from 'rxjs/operators'

import { rxAxios } from '../../utils'
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
  defaultState: DetailState = {
    detail: { status: 'loading' },
  }

  cancelFetchData = signal()

  fetchData = effect<DetailState, void>(({ payload$, meta }) => {
    const detailId = meta.caseId

    return payload$.pipe(
      switchMap(() =>
        ssrAware(
          rxAxios.get<DetailData>(`/resource/${detailId}.json`).pipe(
            takeUntil(this.cancelFetchData.signal$(meta)),
            map((data) => action(this.updateDetail, { status: 'success', ...data })),
            startWith(action(this.updateDetail, { status: 'loading' })),
            catchError(() => [action(this.updateDetail, { status: 'failed' })]),
          ),
        ),
      ),
    )
  })

  private updateDetail = reducer<DetailState, DetailState['detail']>((state, detail) => {
    state.detail = detail
  })
}
