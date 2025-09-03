import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const Stocks = new Collection({
  name: 'supabase-stock',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-stock'),
})
Stocks.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(Stocks, { name: 'stock' })
void syncManager.syncAll()

export default Stocks
