import { GetServerSideProps } from 'next'

import { waitUntil } from '@orch/core'
import { useLocalModel, withContextModelProvider } from '@orch/react'

import { DetailComponent } from '@/modules/detail'
import { DetailModel, DetailState } from '@/modules/detail/model'

export default withContextModelProvider(
  DetailComponent,
  ({ defaultState }: { defaultState: DetailState }) => {
    const model = useLocalModel(DetailModel, [defaultState])

    return [[DetailModel, model]]
  },
)

export const getServerSideProps: GetServerSideProps = async (req) => {
  const model = new DetailModel({ detailId: `${req.query.detailId}` })

  await waitUntil(model, ({ detail }) => detail.status !== 'loading')

  return { props: { defaultState: model.getState() } }
}
