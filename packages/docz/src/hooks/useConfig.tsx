import merge from 'deepmerge'
import { state, ThemeConfig as ThemeConfigObj } from '../state'

export const useConfig = (): ThemeConfigObj => {
  const { transform, config, themeConfig = {} } = state.use()
  const newConfig = merge(themeConfig, config ? config.themeConfig : {})

  return {
    ...config,
    themeConfig: transform ? transform(newConfig) : newConfig,
  }
}
