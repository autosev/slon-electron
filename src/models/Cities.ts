import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const Cities = new Collection({
  name: 'supabase-city',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-city'),
})
Cities.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(Cities, { name: 'city' })
void syncManager.sync('city')

export default Cities
