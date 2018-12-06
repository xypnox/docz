import { useMemo } from 'react'
import { pipe, get, omit, flattenDepth } from 'lodash/fp'
import { ulid } from 'ulid'
import match from 'match-sorter'
import sort from 'array-sort'

import { compare, flatArrFromObject, mergeArrBy } from '../utils/helpers'
import { state, Entry, MenuItem } from '../state'

const noMenu = (entry: Entry) => !entry.menu
const fromMenu = (menu: string) => (entry: Entry) => entry.menu === menu
const entryAsMenu = (entry: Entry) => ({
  name: entry.name,
  route: entry.route,
})

const entriesOfMenu = (menu: string, entries: Entry[]) =>
  entries.filter(fromMenu(menu)).map(entryAsMenu)

const parseMenu = (entries: Entry[]) => (name: string) => ({
  name,
  menu: entriesOfMenu(name, entries),
})

type Menus = MenuItem[]

const menusFromEntries = (entries: Entry[]) => {
  const entriesWithoutMenu = entries.filter(noMenu).map(entryAsMenu)
  const menus = flatArrFromObject(entries, 'menu').map(parseMenu(entries))
  return [...entriesWithoutMenu, ...menus]
}

const parseItemStr = (item: MenuItem | string) =>
  typeof item === 'string' ? { name: item } : item

const normalize = (item: MenuItem | string): MenuItem => {
  const selected = parseItemStr(item) as MenuItem

  return {
    ...selected,
    id: selected.id || ulid(),
    menu: Array.isArray(selected.menu)
      ? selected.menu.map(normalize)
      : selected.menu,
  }
}

const clean = (item: MenuItem) =>
  item.href || item.route ? omit('menu', item) : item

const normalizeAndClean = pipe(
  normalize,
  clean
)

const mergeMenus = (entriesMenu: Menus, configMenu: Menus): Menus => {
  const first = entriesMenu.map(normalizeAndClean)
  const second = configMenu.map(normalizeAndClean)
  const merged = mergeArrBy<MenuItem>('name', first, second)

  return merged.map(item => {
    if (!item.menu) return item
    const found: any = second.find(i => i.name === item.name)
    const foundMenu = found && found.menu

    return {
      ...item,
      menu: foundMenu
        ? mergeMenus(item.menu, foundMenu)
        : item.menu || found.menu,
    }
  })
}

const UNKNOWN_POS = Infinity

const findPos = (item: any, orderedList: string[] = []) => {
  const name = typeof item !== 'string' ? get('name', item) : item
  const pos = orderedList.findIndex(item => item === name)
  return pos !== -1 ? pos : UNKNOWN_POS
}

type ToCompare = Menus | undefined
const compareWithMenu = (to: ToCompare = []) => (a: string, b: string) => {
  const list = to.map((i: any) => i.name || i)
  return compare(findPos(a, list), findPos(b, list))
}

const sortMenus = (first: Menus, second: Menus | undefined = []): Menus => {
  const sorted: Menus = sort(first, compareWithMenu(second))

  return sorted.map(item => {
    if (!item.menu) return item
    const found = second.find(menu => menu.name === item.name)
    const foundMenu = found && found.menu

    return {
      ...item,
      menu: foundMenu ? sortMenus(item.menu, foundMenu) : item.menu,
    }
  })
}

const search = (val: string, menu: MenuItem[]) => {
  const items = menu.map(item => [item].concat(item.menu || []))
  const flattened = flattenDepth(2, items)
  return match(flattened, val, { keys: ['name'] })
}

export interface UseMenusParams {
  query?: string
}

export const useMenus = ({ query = '' }: UseMenusParams) => {
  const { entries, config } = state.use()
  if (!entries || !config) return null

  const arr = Object.values(entries)
  const entriesMenu = useMemo(() => menusFromEntries(arr), [arr])
  const merged = useMemo(
    () => mergeMenus(entriesMenu as MenuItem[], config.menu),
    [entriesMenu, config.menu]
  )

  const sorted = useMemo(() => sortMenus(merged, config.menu), [
    merged,
    config.menu,
  ])

  return query.length > 0 ? search(query, sorted) : sorted
}
