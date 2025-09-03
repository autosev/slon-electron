import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const ProductBarcodes = new Collection({
  name: 'supabase-product-barcode',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-product-barcode'),
})
ProductBarcodes.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(ProductBarcodes, { name: 'product_barcode' })
void syncManager.sync('product_barcode')

export default ProductBarcodes
