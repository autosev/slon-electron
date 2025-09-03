import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const ProductImages = new Collection({
  name: 'supabase-product-image',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-product-image'),
})
ProductImages.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(ProductImages, { name: 'product_image' })
void syncManager.sync('product_image')

export default ProductImages
