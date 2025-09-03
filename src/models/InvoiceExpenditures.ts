import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const InvoiceExpenditures = new Collection({
  name: 'supabase-invoice-expenditure',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-invoice-expenditure'),
})
InvoiceExpenditures.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(InvoiceExpenditures, { name: 'invoice_expenditure' })
void syncManager.sync('invoice_expenditure')

export default InvoiceExpenditures
