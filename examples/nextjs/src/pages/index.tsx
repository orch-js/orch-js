import { ComponentProps } from 'react'
import { GetStaticProps } from 'next'

import { Home, HomeStatus } from '@/modules/home'

export default Home

export const getStaticProps: GetStaticProps<ComponentProps<typeof Home>> = async () => {
  const list = (await import('../../public/resource/list.json')).default

  return { props: { defaultStatus: { status: HomeStatus.idle, list } } }
}
