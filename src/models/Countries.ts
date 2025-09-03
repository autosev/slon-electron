import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const Countries = new Collection({
  name: 'supabase-country',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-country'),
})
Countries.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(Countries, { name: 'country' })
void syncManager.sync('country')

export default Countries
