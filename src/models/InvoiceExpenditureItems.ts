import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const InvoiceExpenditureItems = new Collection({
  name: 'supabase-invoice-expenditure-item',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-invoice-expenditure-item'),
})
InvoiceExpenditureItems.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(InvoiceExpenditureItems, { name: 'invoice_expenditure_item' })
void syncManager.sync('invoice_expenditure_item')

export default InvoiceExpenditureItems
