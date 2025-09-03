import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const Vendors = new Collection({
  name: 'supabase-vendor',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-vendor'),
})
Vendors.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(Vendors, { name: 'vendor' })
void syncManager.sync('vendor')

export default Vendors
