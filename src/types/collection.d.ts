export {}

declare global {
  interface CollectionItem {
    id: number
    name: string
    parent_id: number | null
    product_type_id: number
    sort_order: number
    has_submenu: boolean
  }

  interface CollectionMenuItem {
    key: string
    id: number
    label: string
    items: CollectionMenuItem[]
    product_type_id: number
    parent_id: number | null
    sort_order: number
    has_submenu: boolean
  }
}
