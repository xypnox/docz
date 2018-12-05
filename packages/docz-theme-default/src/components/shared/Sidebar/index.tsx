import { Fragment } from 'react'
import { jsx } from '@emotion/core'
import { SFC, useState, useEffect } from 'react'
import { MenuItem, useMenus } from 'docz'
import withSizes from 'react-sizes'
import styled from '@emotion/styled'
import matchSorter from 'match-sorter'
import flattendepth from 'lodash.flattendepth'

import { Logo } from '../Logo'
import { Search } from '../Search'
import { Menu } from './Menu'
import { Docz } from './Docz'
import { Hamburguer } from './Hamburguer'

import { get } from '@utils/theme'
import { mq, breakpoints } from '@styles/responsive'
import { usePrevious } from '@utils/usePrevious'

interface WrapperProps {
  opened: boolean
  theme?: any
}

const sidebarBg = get('colors.sidebarBg')
const sidebarText = get('colors.sidebarText')
const sidebarBorder = get('colors.sidebarBorder')

const Wrapper = styled.div<WrapperProps>`
  position: relative;
  width: 280px;
  min-width: 280px;
  min-height: 100vh;
  background: ${sidebarBg};
  transition: transform 0.2s, background 0.3s;
  z-index: 1000;

  ${get('styles.sidebar')};
  ${mq({
    position: ['absolute', 'absolute', 'absolute', 'relative'],
  })};

  dl {
    padding: 0;
    margin: 0 16px;
  }

  dl a {
    font-weight: 400;
  }

  @media screen and (max-width: ${breakpoints.desktop - 1}px) {
    transform: translateX(${p => (p.opened ? '-100%' : '0')});
  }
`

const Content = styled('div')`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: 280px;
  min-width: 280px;
  height: 100%;
  max-height: 100vh;
`

const Menus = styled('nav')`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
`

const Empty = styled('div')`
  flex: 1;
  opacity: 0.7;
  padding: 0 24px;
  color: ${sidebarText};
`

const Footer = styled('div')`
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: ${sidebarText};
  border-top: 1px dashed ${sidebarBorder};
`

const FooterLink = styled('a')`
  padding: 0;
  margin: 0;
  margin-left: 5px;
`

const FooterLogo = styled(Docz as any)<{ width: number }>`
  fill: ${sidebarText};
`

interface OpenProps {
  opened: boolean
}

const ToggleBackground = styled.div<OpenProps>`
  content: '';
  display: ${p => (p.opened ? 'none' : 'block')};
  position: fixed;
  background-color: rgba(0, 0, 0, 0.4);
  width: 100vw;
  height: 100vh;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  cursor: pointer;
  z-index: 99;
`

const match = (val: string, menu: MenuItem[]) => {
  const items = menu.map(item => [item].concat(item.menu || []))
  const flattened = flattendepth(items, 2)
  return matchSorter(flattened, val, { keys: ['name'] })
}

interface SidebarProps {
  isDesktop: boolean
}

const SidebarBase: SFC<SidebarProps> = ({ isDesktop }) => {
  const menusInitial = useMenus()
  const [hidden, setHidden] = useState(true)
  const [searching, setSearching] = useState(false)
  const [menus, setMenus] = useState(menusInitial)
  const [lastVal, setLastVal] = useState('')
  const prevIsDesktop = usePrevious(isDesktop)

  useEffect(() => {
    if (!hidden && !prevIsDesktop && isDesktop) {
      setHidden(true)
      document.documentElement!.classList.remove('with-overlay')
    }
  })

  const search = (initial: MenuItem[], menus: MenuItem[], val: string) => {
    const change = !val.startsWith(lastVal)

    setLastVal(val)
    return match(val, change ? initial : menus)
  }

  const handleSearchDocs = (
    initial: MenuItem[] | null,
    menus: MenuItem[] | null
  ) => (val: string) => {
    if (!initial || !menus) return
    const isEmpty = val.length === 0

    setMenus(isEmpty ? initial : search(initial, menus, val))
    setSearching(!isEmpty)
  }

  const addOverlayClass = (isHidden: boolean) => {
    const method = !isHidden ? 'add' : 'remove'

    if (window && typeof window !== 'undefined' && !isDesktop) {
      document.documentElement!.classList[method]('with-overlay')
    }
  }

  const handleSidebarToggle = () => {
    if (isDesktop) return
    setHidden(!hidden)
    addOverlayClass(!hidden)
  }

  return (
    <Fragment>
      <Wrapper opened={hidden}>
        <Content>
          <Hamburguer opened={!hidden} onClick={handleSidebarToggle} />
          <Logo showBg={!hidden} />
          <Search onSearch={handleSearchDocs(menusInitial, menus)} />

          {menus && menus.length === 0 ? (
            <Empty>No documents found.</Empty>
          ) : (
            <Menus>
              {menus &&
                menus.map(menu => (
                  <Menu
                    key={menu.id}
                    item={menu}
                    sidebarToggle={handleSidebarToggle}
                    collapseAll={Boolean(searching)}
                  />
                ))}
            </Menus>
          )}
          <Footer>
            Built with
            <FooterLink href="https://docz.site" target="_blank">
              <FooterLogo width={40} />
            </FooterLink>
          </Footer>
        </Content>
      </Wrapper>
      <ToggleBackground opened={hidden} onClick={handleSidebarToggle} />
    </Fragment>
  )
}

const mapSizesToProps = ({ width }: { width: number }) => ({
  isDesktop: width >= breakpoints.desktop,
})

export const Sidebar = withSizes(mapSizesToProps)(SidebarBase)
