import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const ProductTableItems = new Collection<ProductTableItem>({
  name: 'supabase-product-table-item',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-product-table-item'),
})
ProductTableItems.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(ProductTableItems, { name: 'product_table_item' })
void syncManager.sync('product_table_item')

ProductItems.on('updateOne', () => syncManager.sync('product_table_item'))
ProductPackages.on('updateOne', () => syncManager.sync('product_table_item'))

export default ProductTableItems
