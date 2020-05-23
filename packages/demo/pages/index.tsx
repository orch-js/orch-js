import { ComponentProps } from 'react'
import { GetStaticProps } from 'next'

import { Home, HomeStatus, ListValue } from '@orch/demo/pages/home'
import { rxAxios } from '@orch/demo/utils'

export default Home

export const getStaticProps: GetStaticProps<ComponentProps<typeof Home>> = async () => {
  const list = await rxAxios
    .get<ListValue[]>('http://127.0.0.1:3000/resource/list.json')
    .toPromise()

  return { props: { defaultStatus: { status: HomeStatus.idle, list } } }
}
