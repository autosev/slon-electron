import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const ProductTypes = new Collection({
  name: 'supabase-product-type',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-product-type'),
})
ProductTypes.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(ProductTypes, { name: 'product_type' })
void syncManager.syncAll()

export default ProductTypes
