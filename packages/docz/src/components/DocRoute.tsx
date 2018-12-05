import * as React from 'react'
import { useEffect, SFC } from 'react'
import { withMDXComponents } from '@mdx-js/tag/dist/mdx-provider'
import { RouteProps } from 'react-router'
import imported from 'react-imported-component'

import { Entry } from '../state'
import { ComponentsMap } from './DocPreview'
import { AsyncComponent } from './AsyncComponent'

export async function loadFromImports(path: string): Promise<SFC<any>> {
  // tslint:disable-next-line
  const { imports } = await import('~imports')
  const { default: Component, getInitialData } = await imports[path]()
  const ExportedComponent: SFC<any> = props => (
    <AsyncComponent
      {...props}
      as={Component || 'div'}
      getInitialData={getInitialData}
    />
  )

  return withMDXComponents(ExportedComponent)
}

export const loadRoute: any = (path: string, LoadingComponent: any) =>
  imported(async () => loadFromImports(path), {
    async: true,
    LoadingComponent,
  })

interface DocRouteProps extends RouteProps {
  component: any
  components: ComponentsMap
  entry: Entry
}

export const DocRoute: SFC<DocRouteProps> = ({
  entry,
  components,
  component: Component,
  ...props
}) => {
  const Page: any = components.page
  const common = { ...props, doc: entry }
  useEffect(() => window.scrollTo(0, 0), [])

  return Page ? (
    <Page {...common}>
      <Component {...common} />
    </Page>
  ) : (
    <Component {...common} />
  )
}
