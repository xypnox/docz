import { useEffect, Children } from 'react'
import { withRouter } from 'react-router'

export const ScrollToTop = withRouter(({ children, location }) => {
  useEffect(() => window.scrollTo(0, 0), [location])
  return Children.only(children)
})
