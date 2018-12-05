import * as React from 'react'
import { SFC } from 'react'
import { useConfig } from 'docz'
import styled, { css } from 'react-emotion'
import lighten from 'polished/lib/color/lighten'
import darken from 'polished/lib/color/darken'
import Maximize from 'react-feather/dist/icons/maximize'
import Minimize from 'react-feather/dist/icons/minimize'
import Refresh from 'react-feather/dist/icons/refresh-cw'
import Code from 'react-feather/dist/icons/code'

import { get as themeGet } from '@utils/theme'
import { CodeSandboxLogo } from './CodeSandboxLogo'
import { ActionButton, ClipboardAction } from '../Editor/elements'

const borderColor = themeGet('colors.border')

const Actions = styled('div')`
  display: flex;
  justify-content: flex-end;
  padding: 0 5px;
  background: ${p =>
    p.theme.docz.mode === 'light'
      ? lighten(0.13, borderColor(p))
      : darken(0.04, borderColor(p))};
  border-left: 1px solid ${themeGet('colors.border')};
  border-bottom: 1px solid ${themeGet('colors.border')};
`

const actionClass = (p: any) => css`
  padding: 3px 10px;
  border-left: 1px solid ${borderColor(p)};
`

const Action = styled(ActionButton)`
  ${actionClass};
`

const ActionLink = Action.withComponent('a')
const Clipboard = styled(ClipboardAction as any)`
  ${actionClass};
`

export interface ActionsBarProps {
  code: string
  showEditor: boolean
  fullscreen: boolean
  codesandboxUrl: string
  onClickRefresh: () => void
  onClickFullscreen: () => void
  onClickEditor: () => void
}

export const ActionsBar: SFC<ActionsBarProps> = ({
  showEditor,
  code,
  fullscreen,
  codesandboxUrl,
  onClickRefresh,
  onClickFullscreen,
  onClickEditor,
}) => {
  const config = useConfig()
  return (
    <Actions withRadius={showEditor}>
      <Action onClick={onClickRefresh} title="Refresh playground">
        <Refresh width={15} />
      </Action>
      {config.codeSandbox && config.codesandbox !== 'undefined' && (
        <ActionLink
          href={codesandboxUrl}
          target="_blank"
          title="Open in CodeSandbox"
        >
          <CodeSandboxLogo style={{ height: '100%' }} width={15} />
        </ActionLink>
      )}
      <Clipboard content={code} />
      <Action
        onClick={onClickFullscreen}
        title={fullscreen ? 'Minimize' : 'Maximize'}
      >
        {fullscreen ? <Minimize width={15} /> : <Maximize width={15} />}
      </Action>
      <Action
        onClick={onClickEditor}
        title={showEditor ? 'Close editor' : 'Show editor'}
      >
        <Code width={15} />
      </Action>
    </Actions>
  )
}
