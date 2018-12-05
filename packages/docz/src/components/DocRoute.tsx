import * as React from 'react'
import { SFC } from 'react'
import { withMDXComponents } from '@mdx-js/tag/dist/mdx-provider'
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

interface DocRouteProps {
  component: any
  components: ComponentsMap
  entry: Entry
}

export const DocRoute: SFC<DocRouteProps> = ({
  entry,
  components,
  component: Component,
  ...routeProps
}) => {
  const Page: any = components.page
  const props = { ...routeProps, doc: entry }

  return Page ? (
    <Page {...props}>
      <Component {...props} />
    </Page>
  ) : (
    <Component {...props} />
  )
}
