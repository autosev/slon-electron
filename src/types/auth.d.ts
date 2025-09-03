import { PanelMenuExpandedKeys } from 'primevue'
import type { Session } from '@supabase/supabase-js'
export {}

declare global {
  interface UserConfig {
    selected: {
      product: Product | null
      collectionId: number | null
      stock: Stock | null
      filterOption: FilterOption
    }
    invoice: {
      arrival: {
        drafts: object[]
      }
      expenditure: {
        drafts: object[]
      }
    }
    expandedCollectionKeys: PanelMenuExpandedKeys[]
    lastNotificationCheck: number | null
  }

  interface User {
    id: Session['user']['id']
    name: string
    session: Session | string
    config?: UserConfig
  }
}
