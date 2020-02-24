/*
 * Please do not modify this file, because it was generated from file routers.yaml.
 * Check https://github.com/LeetCode-OpenSource/typed-path-generator for more details.
 * */

import { makePathsFrom, Params } from 'typed-path-generator'

interface ParamsInterface {
  home: void
  detail: Params<'id'>
}

const staticPath = { home: '/', detail: '/detail/:id' }

const pathFactory = {
  home: makePathsFrom<ParamsInterface['home']>(staticPath.home),
  detail: makePathsFrom<ParamsInterface['detail']>(staticPath.detail),
}

export { ParamsInterface as PathParams, staticPath as PATH, pathFactory as paths }
