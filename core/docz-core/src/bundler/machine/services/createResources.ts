import * as path from 'path'
import * as fs from 'fs-extra'
import { finds } from 'load-cfg'
import { format } from 'docz-utils/lib/format'
import { compiled } from 'docz-utils/lib/fs'
import { getOr, fromPairs } from 'lodash/fp'
import latestVersion from 'latest-version'
import findUp from 'find-up'
import sh from 'shelljs'

import * as paths from '../../../config/paths'
import { ServerMachineCtx } from '../context'

const LOCAL_DEPS = ['eslint', 'eslint-loader', 'babel-preset-react-app']
const REQUIRED_DEPS = ['gatsby-plugin-eslint', 'gatsby', 'tslib', 'recast']
const CORE_DEPS = ['docz', 'docz-theme-default', 'gatsby-theme-docz']

const depsFromPairs = async (deps: any[], callback: (dep: string) => any) => {
  return fromPairs(await Promise.all(deps.map(callback)))
}

const getDependencyVersion = async (dep: string) => {
  const version = await latestVersion(dep)
  return [dep, version]
}

const getCoreVersions = async (dep: string) => {
  const depPath = path.join(paths.root, '../../core', dep)
  const pkgJSONFilepath = path.join(depPath, 'package.json')
  const pkgJSON = await fs.readJSON(pkgJSONFilepath, { throws: false })
  const version = await latestVersion(dep)
  return [dep, getOr(version, 'version', pkgJSON)]
}

const getRequiredDeps = async ({ isDoczRepo }: ServerMachineCtx) => {
  const deps = isDoczRepo ? REQUIRED_DEPS.concat(LOCAL_DEPS) : REQUIRED_DEPS
  return depsFromPairs(deps, getDependencyVersion)
}

const getCoreDeps = async ({ isDoczRepo }: ServerMachineCtx) =>
  depsFromPairs(CORE_DEPS, isDoczRepo ? getCoreVersions : getDependencyVersion)

export const fromTemplates = (file: string) => {
  return path.join(paths.templates, file)
}

const copyPkgJSON = () => {
  const pkgJSON = path.join(paths.root, 'package.json')
  sh.cp(pkgJSON, paths.docz)
}

const copyDoczRc = async () => {
  const filepath = await findUp(finds('docz'))
  sh.cp(filepath, paths.docz)
}

const copyAndModifyPkgJson = async (ctx: ServerMachineCtx) => {
  const filepath = path.join(paths.root, 'package.json')
  const movePath = path.join(paths.docz, 'package.json')
  const pkgJSON = await fs.readJSON(filepath, { throws: false })

  const newPkgJSON = {
    ...pkgJSON,
    devDependencies: {
      ...pkgJSON.devDependencies,
      ...(await getRequiredDeps(ctx)),
      ...(await getCoreDeps(ctx)),
    },
    scripts: {
      dev: 'gatsby develop',
      build: 'gatsby build',
    },
    ...(ctx.isDoczRepo && {
      private: true,
      workspaces: ['../../../core/**', '../../../other-packages/**'],
    }),
  }

  await fs.outputJSON(movePath, newPkgJSON, { spaces: 2 })
}

const writeIndexFile = async () => {
  const filepath = path.join(paths.docz, 'src/pages/index.mdx')
  await fs.outputFile(filepath, `# Hello world`)
}

const writeConfigFile = async ({ args, isDoczRepo }: ServerMachineCtx) => {
  const filepath = path.join(paths.docz, 'gatsby-config.js')
  const configFilepath = fromTemplates('gatsby-config.tpl.js')
  const gatsbyConfig = await compiled(configFilepath, { minimize: false })
  const file = gatsbyConfig({
    isDoczRepo,
    config: JSON.stringify({ ...args, root: paths.docz }),
  })

  const raw = await format(file)
  await fs.outputFile(filepath, raw)
}

const writeEslintRc = async ({ isDoczRepo }: ServerMachineCtx) => {
  if (!isDoczRepo) return
  const filepath = path.join(paths.docz, '.eslintrc')
  await fs.outputJSON(filepath, { extends: 'react-app' })
}

export const createResources = async (ctx: ServerMachineCtx) => {
  try {
    copyPkgJSON()
    await copyDoczRc()
    await copyAndModifyPkgJson(ctx)
    await writeIndexFile()
    await writeConfigFile(ctx)
    await writeEslintRc(ctx)
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(err)
  }
}
