import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const ProductItems = new Collection<ProductItem>({
  name: 'supabase-product-item',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-product-item'),
})
ProductItems.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(ProductItems, { name: 'product_item' })
void syncManager.sync('product_item')

export default ProductItems
