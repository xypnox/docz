import * as React from 'react'
import { ComponentType as CT, SFC } from 'react'
import { withMDXComponents } from '@mdx-js/tag/dist/mdx-provider'

import { ComponentsMap } from './DocPreview'

export interface PlaygroundProps {
  className?: string
  style?: any
  wrapper?: CT<any>
  components: ComponentsMap
  component: JSX.Element
  position: number
  code: string
  codesandbox: string
  scope: Record<string, any>
}

export const DefaultPlayground: CT<PlaygroundProps> = ({ component, code }) => (
  <>
    {component}
    {code}
  </>
)

export interface ImplicitPlaygroundProps {
  components: ComponentsMap
  className?: string
  style?: any
  wrapper?: CT<any>
  children: any
  __scope: Record<string, any>
  __position: number
  __code: string
  __codesandbox: string
}

const BasePlayground: SFC<ImplicitPlaygroundProps> = ({
  components,
  className,
  style,
  wrapper: Wrapper,
  children,
  __scope,
  __position,
  __code,
  __codesandbox,
}) => {
  const PlaygroundComp = components.playground || DefaultPlayground
  const props = { className, style, components }
  return (
    <PlaygroundComp
      {...props}
      component={Wrapper ? <Wrapper>{children}</Wrapper> : children}
      scope={__scope}
      position={__position}
      code={__code}
      codesandbox={__codesandbox}
    />
  )
}

export const Playground = withMDXComponents(BasePlayground)
