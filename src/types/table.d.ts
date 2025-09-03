export {}

declare global {
  interface ProductTableItem {
    collection_id: ProductItem['collection_id']
    id: ProductItem['id']
    name: ProductItem['name']
    product_brand_name: ProductItem['product_brand_id']
    product_measure_name: ProductMeasure['name']
    retail_price: ProductPackage['retail_price']
    is_visible_on_website: ProductItem['is_visible_on_website']
  }

  interface ProductTableShipment {
    id: string
    product_item_id: ProductItem['id']
    stock_id: Stock['id']
    total_quantity: number
  }

  interface ProductTableData extends ProductTableItem {
    quantity: ProductShipment['total_quantity']
  }
}
