export {}

declare global {
  interface Vendor {
    id: number
    name: string
  }

  type InvoiceOperation =
    | 'arrival_from_vendor' // Приход товара от поставщика
    | 'arrival_customer_return' // Возврат товара от покупателя
    | 'arrival_employee_return' // Возврат товара от персонала
    | 'expenditure_to_customer' // Отпуск товара покупателю
    | 'expenditure_internal' // Внутрисистемный отпуск
    | 'expenditure_vendor_return' // Возврат товара поставщику
    | 'expenditure_to_employee' // Отпуск товара персоналу

  interface InvoiceDocument {
    id: string
    slug: string
    operation: InvoiceOperation
    issue_date: string
    note: string
    parent_id: InvoiceDocument['id'] | null
    created_by: string
    created_at: string
  }

  interface InvoiceArrival {
    id: InvoiceDocument['id']
    recipient_stock_id: Stock['id']
    vendor_id: Vendor['id'] | null
    employee_id: Employee['id'] | null
    customer_id: string | null
    status: 'completed' | 'reversed'
  }

  interface InvoiceArrivalItem {
    id: number
    invoice_arrival_id: InvoiceArrival['id']
    product_item_id: ProductItem['id']
    product_package_id: ProductPackage['id']
    quantity: number
    price: number
  }

  interface InvoiceExpenditure {
    id: Invoice['id']
    sender_stock_id: Stock['id']
    recipient_stock_id: Stock['id'] | null
    vendor_id: number | null
    employee_id: Employee['id'] | null
    customer_id: string | null
    status: 'completed' | 'prior' | 'rejected' | 'reversed'
  }

  interface InvoiceExpenditureItem {
    id: number
    invoice_expenditure_id: InvoiceExpenditure['id']
    product_item_id: ProductItem['id']
    product_shipment_id: number
    product_package_id: ProductPackage['id']
    quantity: number
    retail_price: number
  }

  type InvoiceEditorStatus = 'new' | 'draft'

  interface InvoiceDocumentEditor<TInvoice = any, TItem = any> {
    id: InvoiceDocument['id']
    slug: InvoiceDocument['slug']
    operation: InvoiceDocument['operation'] | null
    issue_date: InvoiceDocument['issue_date']
    note: InvoiceDocument['note']
    parent_id: InvoiceDocument['parent_id']
    created_at: InvoiceDocument['created_at']
    created_by?: InvoiceDocument['created_by']
    invoice: TInvoice
    items: TItem[]
  }

  interface InvoiceArrivalEditor {
    id: InvoiceArrival['id']
    recipient_stock_id: Stock['id'] | null
    vendor_id: Vendor['id'] | null
    employee_id: Employee['id'] | null
    customer_id: string | null
    status: InvoiceArrival['status'] | InvoiceEditorStatus
  }

  interface InvoiceArrivalItemEditor {
    invoice_arrival_id: InvoiceArrival['id']
    product_item_id: ProductItem['id']
    product_package_id: ProductPackage['id']
    quantity: number
    price: number
  }

  type InvoiceArrivalDocumentEditor = InvoiceDocumentEditor<
    InvoiceArrivalEditor,
    InvoiceArrivalItemEditor
  >

  interface InvoiceExpenditureEditor {
    id: InvoiceExpenditure['id']
    sender_stock_id: Stock['id'] | null
    recipient_stock_id: Stock['id'] | null
    vendor_id: number | null
    employee_id: Employee['id'] | null
    customer_id: string | null
    status: InvoiceExpenditure['status'] | InvoiceEditorStatus
  }

  interface InvoiceExpenditureItemEditor {
    invoice_expenditure_id: InvoiceExpenditure['id']
    product_item_id: ProductItem['id']
    product_shipment_id: number
    product_package_id: ProductPackage['id']
    quantity: number
    retail_price: number
  }

  type InvoiceExpenditureDocumentEditor = InvoiceDocumentEditor<
    InvoiceExpenditureEditor,
    InvoiceExpenditureItemEditor
  >
}
