import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const ProductMeasures = new Collection({
  name: 'supabase-product-measure',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-product-measure'),
})
ProductMeasures.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(ProductMeasures, { name: 'product_measure' })
void syncManager.sync('product_measure')

export default ProductMeasures
