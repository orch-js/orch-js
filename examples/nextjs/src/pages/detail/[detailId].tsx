import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'

import { waitUntil } from '@orch/core'
import { useLocalModel, withContextModelProvider } from '@orch/react'

import { DetailComponent } from '@/modules/detail'
import { DetailModel, DetailState } from '@/modules/detail/model'

export default withContextModelProvider(
  DetailComponent,
  ({ defaultState }: { defaultState: DetailState }) => {
    const router = useRouter()
    const model = useLocalModel(DetailModel, [`${router.query.detailId}`, defaultState])

    return [[DetailModel, model]]
  },
)

export const getServerSideProps: GetServerSideProps = async (req) => {
  const model = new DetailModel(`${req.query.detailId}`)

  model.fetchData()

  await waitUntil(model, ({ state }) => state.detail.status !== 'loading')

  return { props: { defaultState: model.state } }
}
