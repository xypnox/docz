import { useEffect } from 'react'
import { state } from '../state'

export const setupDataServer = (url: string | undefined) => {
  useEffect(() => {
    if (url) {
      const socket = new WebSocket(url)
      socket.onmessage = (ev: any) => {
        const { type, payload } = JSON.parse(ev.data)
        const prop = type.startsWith('state.') && type.split('.')[1]

        if (prop) {
          state.set(state => ({ ...state, [prop]: payload }))
        }
      }
    }
  }, [])
}
