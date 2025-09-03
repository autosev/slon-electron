import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const InvoiceDocuments = new Collection({
  name: 'supabase-invoice-document',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-invoice-document'),
})
InvoiceDocuments.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(InvoiceDocuments, { name: 'invoice_document' })
void syncManager.sync('invoice_document')

export default InvoiceDocuments
