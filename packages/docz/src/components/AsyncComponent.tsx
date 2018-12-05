import * as React from 'react'
import { useState, useEffect } from 'react'
import { SFC, ComponentType } from 'react'

import { isFn } from '../utils/helpers'

export interface AsyncComponentProps {
  as: ComponentType<any>
  getInitialData?: (props: any) => any
}

export const AsyncComponent: SFC<AsyncComponentProps> = ({
  as: Comp,
  getInitialData,
  ...props
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({})

  const fetch = async () => {
    if (getInitialData && isFn(getInitialData)) {
      setLoading(true)

      try {
        const data = await getInitialData(props)
        setData(data)
        setError(null)
        setLoading(false)
      } catch (error) {
        setData({})
        setError(null)
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetch()
  }, [])

  return <Comp {...props} data={{ ...data, loading, error }} />
}
