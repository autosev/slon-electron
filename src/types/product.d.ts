export {}

declare global {
  type FilterOption = 'Все' | 'В наличии' | 'Нет на сайте'

  interface ProductMeasure {
    id: number
    name: string
  }

  interface ProductBrand {
    id: number
    name: string
  }

  interface ProductType {
    id: number
    name: string
    slug: string
    characteristics_scheme: CharacteristicsScheme
  }

  interface ProductItem {
    id: number
    previous_id: number | null
    collection_id: CollectionItem['id'] | null
    product_brand_id: ProductBrand['id']
    product_type_id: ProductType['id']
    country_id: Country['id'] | null
    name: string
    characteristics: {
      [key: string]: any
    }
    product_measure_id: number
    retail_price: number
    is_visible_on_website: boolean
  }

  interface ProductItemInsert {
    previous_id: number | null
    collection_id: number | null
    product_brand_id: number | null
    product_type_id: number
    country_id: Country['id'] | null
    name: string
    characteristics: {
      [key: string]: any
    }
    product_measure_id: number
    retail_price: number
    is_visible_on_website: boolean
  }

  interface ProductPackage {
    id: number
    name: string
    product_item_id: ProductItem['id']
    conversion_factor: number
    retail_price: number
  }

  interface ProductPackageInsert {
    name: string
    conversion_factor: number
    retail_price: number
  }

  interface ProductImage {
    id: number
    product_item_id: ProductItem['id']
    path: string
    created_at: string
    created_by: string | null
  }

  interface ProductImageUploader {
    select: ProductImage[]
    insert: File[]
    delete: ProductImage['path'][]
  }

  interface ProductShipment {
    id: number
    stock_id: number
    product_item_id: number
    invoice_arrival_item_id: InvoiceArrivalItem['id'] | null
    barcode: string | null
    value: number
    price: number
    quantity: number
  }

  interface Product {
    id: ProductItem['id']
    collection_id: ProductItem['collection_id']
    product_brand_id: ProductBrand['id']
    product_type_id: ProductItem['product_type_id']
    name: ProductItem['name']
    retail_price: ProductItem['retail_price']
    brand: ProductBrand
    measure: ProductMeasure
    is_visible_on_website: boolean
    shipments: ProductShipment[]
  }

  interface ProductBarcode {
    id: number
    product_item_id: ProductItem['id']
    code: string
    type: 'factory' | 'internal'
  }

  interface ProductBarcodeInsert {
    code: string
    type: 'factory' | 'internal'
  }

  interface ProductTableItem {
    collection_id: ProductItem['collection_id']
    id: ProductItem['id']
    name: ProductItem['name']
    product_brand_name: ProductItem['product_brand_id']
    product_measure_name: ProductMeasure['name']
    retail_price: ProductPackage['retail_price']
    is_visible_on_website: ProductItem['is_visible_on_website']
  }
}
