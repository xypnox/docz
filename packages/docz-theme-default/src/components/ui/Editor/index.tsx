import * as React from 'react'
import { useState, SFC } from 'react'
import { useConfig } from 'docz'
import { jsx } from '@emotion/core'
import styled from '@emotion/styled'
import getter from 'lodash.get'

import { CodeMirror } from '../CodeMirror'
import { ClipboardAction } from './elements'
import { get } from '@utils/theme'

const getLanguage = (children: any) => {
  const defaultLanguage = 'jsx'
  if (typeof children === 'string') return defaultLanguage

  const language = getter(children, 'props.props.className') || defaultLanguage
  const result = language.replace('language-', '')

  if (result === 'js' || result === 'javascript') return 'jsx'
  if (result === 'ts' || result === 'tsx' || result === 'typescript') {
    return 'text/typescript'
  }
  return result
}

const getChildren = (children: any) =>
  children && typeof children !== 'string'
    ? getter(children, 'props.children')
    : children

const Wrapper = styled('div')`
  margin: 30px 0;
  position: relative;
  width: 100%;
  border: 1px solid ${get('colors.border')};
`

const Actions = styled('div')`
  z-index: 999;
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 10px;
  background: transparent;
`

export interface EditorProps {
  children: any
  className?: string
  editorClassName?: string
  actions?: React.ReactNode
  readOnly?: boolean
  mode?: string
  matchBrackets?: boolean
  indentUnit?: number
  language?: string
  withLastLine?: boolean
  onChange?: (code: string) => any
}

export const Editor: SFC<EditorProps> = ({
  mode,
  children,
  actions,
  onChange,
  className,
  editorClassName,
  withLastLine,
  language: defaultLanguage,
  ...props
}) => {
  const config = useConfig()
  const [code, setCode] = useState(getChildren(children))

  const removeLastLine = (editor: any) => {
    if (editor && !withLastLine && props.readOnly) {
      const lastLine = editor.lastLine()
      editor.doc.replaceRange('', { line: lastLine - 1 }, { line: lastLine })
    }
  }

  const handleChange = (editor: any, data: any, code: string) => {
    onChange && onChange(code)
    setCode(code)
  }

  const editorProps = {
    value: code,
    className: editorClassName,
    editorDidMount: removeLastLine,
    onBeforeChange: handleChange,
    options: {
      ...props,
      tabSize: 2,
      lineNumbers: true,
      lineWrapping: true,
      autoCloseTags: true,
      mode: defaultLanguage || getLanguage(children) || mode,
      theme: getter(config, 'themeConfig.codemirrorTheme', 'docz-light'),
    },
  }

  return (
    <Wrapper className={className}>
      <CodeMirror {...editorProps} />
      <Actions>{actions || <ClipboardAction content={code} />}</Actions>
    </Wrapper>
  )
}

Editor.defaultProps = {
  mode: 'js',
  readOnly: true,
  matchBrackets: true,
  indentUnit: 2,
}
