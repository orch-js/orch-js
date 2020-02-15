import { fromFetch } from 'rxjs/fetch'
import { startWith, switchMap, catchError } from 'rxjs/operators'
import { Model, effect, reducer } from '@orch/model'

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

export class DetailModel extends Model<DetailState> {
  defaultState = { status: DetailStatus.idle, data: null }

  private updateStatus = reducer(this)<DetailStatus>((state, status) => {
    state.status = status
  })

  private updateData = reducer(this)((state, data: DetailData) => {
    state.data = data
  })

  fetchData = effect(this)<DetailData['id']>((id$) =>
    id$.pipe(
      switchMap((id) =>
        fromFetch(`/resource/${id}.json`).pipe(
          switchMap((data): Promise<DetailData> => data.json()),
          switchMap((data) => [
            this.updateStatus.asAction(DetailStatus.idle),
            this.updateData.asAction(data),
          ]),
          startWith(this.updateStatus.asAction(DetailStatus.loading)),
          catchError(() => [this.updateStatus.asAction(DetailStatus.failed)]),
        ),
      ),
    ),
  )
}
