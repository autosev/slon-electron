import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const ProductTableShipments = new Collection<ProductTableShipment>({
  name: 'supabase-product-table-shipment',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-product-table-shipment'),
})
ProductTableShipments.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(ProductTableShipments, { name: 'product_table_shipment' })
void syncManager.sync('product_table_shipment')

ProductShipments.on('updateOne', () => syncManager.sync('product_table_shipment'))

export default ProductTableShipments
