import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const ProductShipments = new Collection({
  name: 'supabase-product-shipment',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-product-shipment'),
})
ProductShipments.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()
const clientStore = useClientStore()
const { currentEmployee } = storeToRefs(clientStore)

syncManager.addCollection(ProductShipments, {
  name: 'product_shipment',
  filters: [
    { type: 'eq', column: 'stock_id', value: currentEmployee.value?.stock_id },
    { type: 'gt', column: 'quantity', value: 0 },
  ],
})
void syncManager.sync('product_shipment')

export default ProductShipments
