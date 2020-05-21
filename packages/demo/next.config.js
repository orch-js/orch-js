const fs = require('fs')
const path = require('path')

const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: false })
const withPlugins = require('next-compose-plugins')

const PACKAGES = fs.readdirSync(path.join(__dirname, '..'))

module.exports = withPlugins([withBundleAnalyzer], {
  webpack(config) {
    PACKAGES.forEach((packageSuffix) => {
      const pkgAlias = `@orch/${packageSuffix}`
      const pkgPath = path.join(__dirname, `../${packageSuffix}/src`)

      config.resolve.alias[pkgAlias] = pkgPath
      config.module.rules[0].include.unshift(pkgPath)
    })

    return config
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    modern: true,
    granularChunks: true,
  },
})
