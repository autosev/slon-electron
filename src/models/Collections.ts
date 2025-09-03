import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const Collections = new Collection({
  name: 'supabase-collection',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-collection'),
})
Collections.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(Collections, { name: 'collection' })
void syncManager.sync('collection')

export default Collections
