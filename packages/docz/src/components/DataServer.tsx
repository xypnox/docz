import { Children, SFC, useEffect } from 'react'
import { state } from '../state'

export interface DataServerProps {
  websocketUrl?: string
}

export const DataServer: SFC<DataServerProps> = ({
  children,
  websocketUrl,
}) => {
  useEffect(() => {
    if (websocketUrl) {
      const socket = new WebSocket(websocketUrl)
      socket.onmessage = (ev: any) => {
        const { type, payload } = JSON.parse(ev.data)
        const prop = type.startsWith('state.') && type.split('.')[1]

        if (prop) {
          state.set(state => ({ ...state, [prop]: payload }))
        }
      }
    }
  }, [])

  return Children.only(children)
}
