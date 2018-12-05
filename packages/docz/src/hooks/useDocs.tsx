import sort from 'array-sort'

import { state, Entry } from '../state'
import { compare } from '../utils/helpers'

export const useDocs = (): Entry[] | null => {
  const { entries, config } = state.use()
  if (!entries || !config) return null

  return sort(Object.values(entries), (a: Entry, b: Entry) =>
    compare(a.name, b.name)
  )
}
