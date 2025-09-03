import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const Organizations = new Collection({
  name: 'supabase-organization',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-organization'),
})
Organizations.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(Organizations, { name: 'organization' })
void syncManager.sync('organization')

export default Organizations
