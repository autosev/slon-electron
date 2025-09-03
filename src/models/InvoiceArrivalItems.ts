import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const InvoiceArrivalItems = new Collection({
  name: 'supabase-invoice-arrival-item',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-invoice-arrival-item'),
})
InvoiceArrivalItems.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(InvoiceArrivalItems, { name: 'invoice_arrival_item' })
void syncManager.sync('invoice_arrival_item')

export default InvoiceArrivalItems
