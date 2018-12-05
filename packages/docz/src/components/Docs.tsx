import * as React from 'react'
import { Fragment } from 'react'
import sort from 'array-sort'

import { state, Entry } from '../state'
import { compare, isFn } from '../utils/helpers'

export interface DocsRenderProps {
  docs: Entry[]
}

export interface DocsProps {
  children?: (renderProps: DocsRenderProps) => React.ReactNode
}

export const Docs: React.SFC<DocsProps> = ({ children }) => {
  const { entries, config } = state.use()

  if (!entries || !config || !children) return null
  if (!isFn(children)) {
    throw new Error(
      'You need to pass a children as a function to your <Docs/> component'
    )
  }

  const arr = Object.values(entries)
  const docs: Entry[] = sort(arr, (a: Entry, b: Entry) =>
    compare(a.name, b.name)
  )

  return <Fragment>{children({ docs })}</Fragment>
}
