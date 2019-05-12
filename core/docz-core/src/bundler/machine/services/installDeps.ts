import { pipe } from 'lodash/fp'
import log from 'signale'
import chalk from 'chalk'
import sh from 'shelljs'
import ora from 'ora'

import * as paths from '../../../config/paths'
import { ServerMachineCtx } from '../context'

const warn: Function = pipe(
  chalk.yellow,
  console.log
)

export const installDeps = async ({ firstInstall }: ServerMachineCtx) => {
  if (firstInstall) {
    warn('\n----------------')
    warn(`We need to install some dependencies in order to run your bundler.`)
    warn('This just happen in the first time you run docz.')
    warn('This could take a while!')
    warn('----------------\n')
    log.await('Installing dependencies\n')
  }

  return new Promise(async (resolve, reject) => {
    const checking = !firstInstall && ora('Checking dependencies...').start()
    const afterInstall = async (code: any, stdout: string, stderr: string) => {
      if (firstInstall) log.success('Dependencies installed successfully!\n')
      if (checking) checking.succeed('Dependencies checked!')
      if (code !== 0) {
        log.fatal(stdout)
        return reject(stderr)
      }
      return resolve()
    }

    sh.cd(paths.docz)
    sh.exec('yarn install', { silent: !firstInstall }, afterInstall)
  })
}
