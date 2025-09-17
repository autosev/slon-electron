export {}

export interface IServer {
  id: string // Уникальный идентификатор UUID
  name: string
  apiUrl: string
  anonKey: string
}

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
