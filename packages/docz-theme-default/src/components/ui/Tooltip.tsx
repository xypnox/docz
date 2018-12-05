import { SFC, ReactNode } from 'react'
import { useConfig } from 'docz'
import { jsx, css } from '@emotion/core'
import styled from '@emotion/styled'
import BaseTooltip from 'rc-tooltip'

import { get } from '@utils/theme'

interface TooltipProps {
  text: ReactNode
  children: ReactNode
}

const overlayStyle = (colors: Record<string, any>) => css`
  .rc-tooltip-inner {
    background: ${colors.tooltipBg};
    color: ${colors.tooltipColor};
  }

  .rc-tooltip-arrow {
    border-top-color: ${colors.tooltipBg};
  }
`

const Link = styled('a')`
  text-decoration: none;
  color: ${get('colors.primary')};
`

export const Tooltip: SFC<TooltipProps> = ({ text, children }) => {
  const { themeConfig } = useConfig()

  return (
    <BaseTooltip
      placement="top"
      trigger={['hover']}
      overlay={text}
      css={overlayStyle(themeConfig.colors)}
    >
      <Link href="#" onClick={(ev: any) => ev.preventDefault()}>
        {children}
      </Link>
    </BaseTooltip>
  )
}
