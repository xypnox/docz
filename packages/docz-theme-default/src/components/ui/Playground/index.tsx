import { useState, useEffect, SFC, Fragment } from 'react'
import { PlaygroundProps, useConfig, useLocalStorage } from 'docz'
import { LiveProvider, LiveError, LivePreview } from 'react-live'
import { css, jsx } from '@emotion/core'
import styled from '@emotion/styled'
import rgba from 'polished/lib/color/rgba'
import Resizable from 're-resizable'
import hotkeys from 'hotkeys-js'
import getter from 'lodash.get'

import { Handle, HANDLE_SIZE } from './Handle'
import { ResizeBar } from './ResizeBar'
import { ActionsBar } from './ActionsBar'
import { Editor as PreBase } from '../Editor'

import { get as themeGet } from '@utils/theme'
import { mq } from '@styles/responsive'

interface OverlayProps {
  full: boolean
}

const whenFullscreen = (on: any, off: any) => (p: OverlayProps) =>
  p.full ? on : off

const Overlay = styled('div')<OverlayProps>`
  box-sizing: border-box;
  z-index: ${whenFullscreen(9999, 0)};
  position: ${whenFullscreen('fixed', 'relative')};
  top: 0;
  left: 0;
  width: ${whenFullscreen('100vw', 'auto')};
  height: ${whenFullscreen('100vh', 'auto')};
  padding: ${whenFullscreen('60px 20px 20px', '0px')};
  margin: ${whenFullscreen('0px', '0 0 30px')};
  background: ${whenFullscreen('rgba(0,0,0,0.5)', 'transparent')};
  transition: background 0.3s;
`

const minusHandleSize = `calc(100% - ${HANDLE_SIZE} + 4px)`
const borderColor = themeGet('colors.border')
const backgroundColor = themeGet('colors.background')

const Wrapper = styled('div')`
  display: flex;
  flex-direction: column;
  height: ${whenFullscreen(minusHandleSize, '100%')};
  width: ${minusHandleSize};
`

const PreviewWrapper = styled('div')<OverlayProps>`
  position: relative;
  flex: 1;
  border: 1px solid ${borderColor};
  background: ${backgroundColor};
  min-height: ${whenFullscreen('198px', 'auto')};
`

const StyledPreview = styled(LivePreview)`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  ${p => mq(themeGet('styles.playground')(p))};
`

const StyledError = styled(LiveError)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 20px;
  background: ${rgba('black', 0.8)};
  font-size: 16px;
  color: white;
`

const Pre = styled(PreBase as any)<any>`
  width: calc(100% - 2px);
  border-radius: 0 !important;
  margin: 0;
`

interface ShowingProps {
  showing: boolean
}

const EditorWrapper = styled('div')<ShowingProps>`
  max-height: ${p => (p.showing ? '9999px' : '0px')};
  transform: scaleY(${p => (p.showing ? '1' : '0')});
  transform-origin: top center;
`

const storage = useLocalStorage()
const parse = (position: number, key: string, defaultValue: any) => {
  const obj = JSON.parse(storage.get(position))
  return obj ? getter(obj, key) : defaultValue
}

export const Playground: SFC<PlaygroundProps> = ({
  position,
  code: initialCode,
  className,
  style,
  scope,
  codesandbox,
  ...props
}) => {
  const config = useConfig()
  const configShowEditor = getter(config, 'themeConfig.showPlaygroundEditor')
  const initialFullscreen = parse(position, 'fullscreen', false)
  const initialWidth = parse(position, 'width', '100%')
  const initialHeight = parse(position, 'height', '100%')

  const [fullscreen, setFullscreen] = useState(initialFullscreen)
  const [width, setWidth] = useState(initialWidth)
  const [height, setHeight] = useState(initialHeight)
  const [code, setCode] = useState(initialCode)
  const [key, setKey] = useState(0)
  const [showEditor, setShowEditor] = useState(configShowEditor)
  const state = { fullscreen, width, height, code, key, showEditor }

  const editorProps = {
    actions: <Fragment />,
    css: css`
      border-top: 0;
    `,
  }

  const resizableProps = {
    minHeight: fullscreen ? 360 : '100%',
    minWidth: 260,
    maxWidth: '100%',
    maxHeight: '100%',
    size: {
      width,
      height,
    },
    style: {
      margin: '0 auto ',
    },
    enable: {
      top: false,
      right: true,
      bottom: fullscreen,
      left: false,
      topRight: false,
      bottomRight: fullscreen,
      bottomLeft: false,
      topLeft: false,
    },
    handleComponent: {
      right: () => <Handle full={fullscreen} horizontal />,
      bottom: () => <Handle full={fullscreen} horizontal={false} />,
    },
    onResizeStop: (e: any, direction: any, ref: any, d: any) => {
      const width = ref.style.width
      const height = ref.style.height
      handleSetSize(width, height)
    },
  }

  const setSize = (fullscreen: boolean) =>
    storage.set(position, JSON.stringify({ ...state, fullscreen }))

  const handleToggleFullscreen = () => {
    if (fullscreen) storage.remove(position)
    else setSize(true)

    setFullscreen(parse(position, 'fullscreen', false))
    setWidth(parse(position, 'width', '100%'))
    setHeight(parse(position, 'height', '100%'))
  }

  const handleSetSize = (width: string, height: string) => {
    const fullscreen = parse(position, 'fullscreen', false)
    setWidth(width)
    setHeight(height)
    setSize(fullscreen)
  }

  const transformCode = (code: string) => {
    if (code.startsWith('()') || code.startsWith('class')) return code
    return `<React.Fragment>${code}</React.Fragment>`
  }

  const codesandboxUrl = (native: boolean): string => {
    const url = 'https://codesandbox.io/api/v1/sandboxes/define'
    return `${url}?parameters=${codesandbox}${native ? `&editorsize=75` : ``}`
  }

  const unloadListener = (): void => storage.remove(position)

  const addUnloadListener = () => {
    if (window && typeof window !== 'undefined') {
      window.addEventListener('beforeunload', unloadListener, false)
    }
  }

  const removeUnloadListener = () => {
    if (window && typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', unloadListener, false)
    }
  }

  useEffect(() => {
    addUnloadListener()
    hotkeys('esc', () => fullscreen && handleToggleFullscreen())

    return () => {
      removeUnloadListener()
      hotkeys.unbind('esc')
    }
  }, [])

  useEffect(
    () => {
      const method = fullscreen ? 'add' : 'remove'
      document.body.classList[method]('with-overlay')
    },
    [fullscreen]
  )

  return (
    <LiveProvider
      code={code}
      scope={scope}
      transformCode={transformCode}
      mountStylesheet={false}
    >
      <Overlay full={fullscreen}>
        {fullscreen ? <ResizeBar onChangeSize={handleSetSize} /> : null}
        <Resizable {...resizableProps}>
          <Wrapper full={fullscreen}>
            <PreviewWrapper full={fullscreen}>
              <StyledPreview className={className} style={style} />
              <StyledError />
            </PreviewWrapper>
            <ActionsBar
              {...{ fullscreen, showEditor, code }}
              codesandboxUrl={codesandboxUrl(config.native)}
              onClickRefresh={() => setKey(key + 1)}
              onClickEditor={() => setShowEditor(!showEditor)}
              onClickFullscreen={handleToggleFullscreen}
            />
            <EditorWrapper showing={showEditor}>
              <Pre {...editorProps} onChange={setCode} readOnly={false}>
                {code}
              </Pre>
            </EditorWrapper>
          </Wrapper>
        </Resizable>
      </Overlay>
    </LiveProvider>
  )
}
