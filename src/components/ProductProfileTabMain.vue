<script setup lang="ts">
const tableStore = useTableStore()
const { selectedStockId } = storeToRefs(tableStore)

const { toCurrencyPrice } = useTools()

const injected = inject<{
  productItem: Ref<ProductItem>
  productItemMeasureName: ComputedRef<ProductMeasure['name']>
  mode?: string
  updateProductCollectionId: (id: CollectionItem['id']) => void
  updateProductCountryId: (id: Country['id']) => void
}>('productProfile')
if (!injected) {
  throw new Error('ProductProfile not provided')
}
const {
  productItem,
  productItemMeasureName,
  mode,
  updateProductCollectionId,
  updateProductCountryId,
} = injected

const shipmentStockId = ref<Stock['id'] | null>(selectedStockId.value)
const productShipmentsData = ref<
  {
    shipment: ProductShipment
    invoiceDocument?: InvoiceDocument
  }[]
>([])

function getInvoiceDocument(invoiceArrivalItemId: InvoiceArrivalItem['id']) {
  const invoiceArrivalItem = InvoiceArrivalItems.findOne(
    { id: invoiceArrivalItemId },
    { reactive: false },
  ) as InvoiceArrivalItem | undefined
  if (invoiceArrivalItem !== undefined) {
    return InvoiceDocuments.findOne(
      { id: invoiceArrivalItem.invoice_arrival_id },
      { reactive: false },
    ) as InvoiceDocument | undefined
  }
  return
}

watchEffect((onCleanup) => {
  if (productItem.value.id !== undefined && shipmentStockId !== null) {
    const productShipmentsCursor = ProductShipments.find({
      product_item_id: productItem.value.id,
      stock_id: shipmentStockId.value,
      quantity: { $gt: 0 },
    })
    const productShipments = (productShipmentsCursor.fetch() as ProductShipment[]) ?? []
    productShipmentsData.value = productShipments.map((shipment) => ({
      shipment,
      invoiceDocument:
        shipment.invoice_arrival_item_id !== null
          ? getInvoiceDocument(shipment.invoice_arrival_item_id)
          : undefined,
    }))

    onCleanup(() => {
      productShipmentsCursor.cleanup()
    })
  } else {
    productShipmentsData.value = []
  }
})
</script>

<template>
  <Fieldset legend="Товар">
    <div class="flex justify-between px-4 py-2">
      <div>
        <CollectionSelect :id="productItem.collection_id" @update:id="updateProductCollectionId" />
      </div>
      <div class="flex gap-3">
        <CountrySelect
          :id="productItem.country_id"
          @update:id="updateProductCountryId"
          class="w-60"
        />
      </div>
    </div>
  </Fieldset>
  <Fieldset v-if="mode !== 'create' && productItem.collection_id !== null" legend="Партии">
    <DataTable :value="productShipmentsData" size="small">
      <template #header>
        <StockSelect v-model:id="shipmentStockId" class="mb-3" />
      </template>
      <Column field="arrival_date" header="Дата поступления">
        <template #body="{ data }">
          {{
            data.shipment.arrival_date
              ? new Date(data.shipment.arrival_date).toLocaleDateString('ru-RU')
              : 'Неизвестно'
          }}
        </template>
      </Column>
      <Column field="quantity" header="Кол-во">
        <template #body="{ data }">
          {{ data.shipment.quantity }} {{ productItemMeasureName }}
        </template>
      </Column>
      <Column field="price" header="Цена">
        <template #body="{ data }">
          {{ toCurrencyPrice(data.shipment.price) }}
        </template>
      </Column>
      <Column field="invoice_arrival_id" header="Накладная" class="!text-end">
        <template #body="{ data }">
          <InvoiceSlug
            v-if="data.invoiceDocument !== undefined"
            :id="data.invoiceDocument.id"
            :slug="data.invoiceDocument.slug"
            :parent_id="data.invoiceDocument.parent_id"
          />
          <span v-else> Неизвестно </span>
        </template>
      </Column>
    </DataTable>
  </Fieldset>
</template>
