export {}

declare global {
  interface SidebarItem {
    title: string
    hideTitle?: boolean
    key: string
    iconClass: string
    badge?: globalThis.ComputedRef<number>
    content: Component
    position: 'top' | 'bottom'
    disabled?: boolean
    onlineOnly?: boolean
  }
}
