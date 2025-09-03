import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const ProductPackages = new Collection({
  name: 'supabase-product-package',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-product-package'),
})
ProductPackages.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(ProductPackages, { name: 'product_package' })
void syncManager.sync('product_package')

export default ProductPackages
