import { useSupabase } from './supabase'
import type { BaseItem } from '@signaldb/core'
import { SyncManager } from '@signaldb/sync'
import createIndexedDBAdapter from '@signaldb/indexeddb'

const { supabase } = useSupabase()
const route = useRoute()

let syncManager: SyncManager<Record<string, any>, BaseItem, any> | null = null

export const useSignalDB = () => {
  if (syncManager === null) {
    syncManager = new SyncManager({
      id: 'supabase-sync-manager',
      persistenceAdapter: (id) => createIndexedDBAdapter(id),
      onError: (options, error) => {
        const { setServerOnlineStatus } = useClientStore()
        setServerOnlineStatus(false)
        console.error(options, error)
      },
      registerRemoteChange({ name }, onChange) {
        supabase
          .channel(`signaldb:${name}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: name }, () => {
            void onChange()
          })
          .subscribe()
      },
      async pull({ name, filters = [] }) {
        const { startSync, endSync, setServerOnlineStatus } = useClientStore()
        const isOnline = navigator.onLine

        if (isOnline === true) {
          void startSync()

          let query: any = supabase.from(name).select()

          for (const filter of filters) {
            if (filter.type === 'eq') query = query.eq(filter.column, filter.value)
            else if (filter.type === 'neq') query = query.neq(filter.column, filter.value)
            else if (filter.type === 'gt') query = query.gt(filter.column, filter.value)
            else if (filter.type === 'like') query = query.like(filter.column, filter.value)
          }

          const { data } = await query

          setServerOnlineStatus(true)
          void endSync(data !== null)

          if (data !== null) {
            return { items: data }
          }
        }
        throw new Error()
      },
      async push({ name }, { changes }) {
        await Promise.all([
          ...changes.added.map(async ({ id, ...item }) => {
            const { status } = await supabase.from(name).insert(item)
            if (status >= 400 && status <= 499) return
          }),
          ...changes.modified.map(async ({ id, ...item }) => {
            const { status } = await supabase.from(name).update(item).eq('id', id)
            if (status >= 400 && status <= 499) return
          }),
          ...changes.removed.map(async (item) => {
            const { status } = await supabase.from(name).delete().eq('id', item.id)
            if (status >= 400 && status <= 499) return
          }),
        ])
      },
    })
  }

  return {
    syncManager,
  }
}
