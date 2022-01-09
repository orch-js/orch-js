const path = require('path')
const fs = require('fs')

const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: false })
const nextTranspileModules = require('next-transpile-modules')
const withPlugins = require('next-compose-plugins')
const { compact } = require('lodash')

const PACKAGES_DIR = path.join(__dirname, '../')

const withTranspileModules = nextTranspileModules(
  compact(
    fs.readdirSync(PACKAGES_DIR).map((dir) => {
      const pkgDir = path.join(PACKAGES_DIR, dir)
      const pkgDirStat = fs.lstatSync(pkgDir)

      if (pkgDirStat.isDirectory()) {
        return path.relative(__dirname, pkgDir)
      }
    }),
  ),
)

module.exports = withPlugins([withBundleAnalyzer, withTranspileModules], {})
