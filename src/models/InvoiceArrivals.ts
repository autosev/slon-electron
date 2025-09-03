import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const InvoiceArrivals = new Collection({
  name: 'supabase-invoice-arrival',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-invoice-arrival'),
})
InvoiceArrivals.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(InvoiceArrivals, { name: 'invoice_arrival' })
void syncManager.sync('invoice_arrival')

export default InvoiceArrivals
