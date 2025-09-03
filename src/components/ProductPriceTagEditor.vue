<script setup lang="ts">
import { ColDef } from 'ag-grid-community'

const { toCurrencyPrice } = useTools()

const priceTagStore = usePriceTagStore()
const { removeItemFromEditor, removeAllItemsFromEditor } = priceTagStore
const { items } = storeToRefs(priceTagStore)

const { getUserStock } = useOrganizationStore()

const selectedStockId = ref(getUserStock()?.id || null)

const PRICE_TAG_WIDTH = 85
const PRICE_TAG_HEIGHT = 40
const PRINT_PAGE_WIDTH = 210
const PRINT_PAGE_HEIGHT = 297
const PRINT_PAGE_MARGIN_Y = 15
const PRINT_PAGE_MARGIN_X = 20

const tagsPerPage = computed(() => {
  const usableWidth = PRINT_PAGE_WIDTH - 2 * PRINT_PAGE_MARGIN_X
  const usableHeight = PRINT_PAGE_HEIGHT - 2 * PRINT_PAGE_MARGIN_Y

  const tagsPerRow = Math.floor(usableWidth / PRICE_TAG_WIDTH)
  const tagsPerColumn = Math.floor(usableHeight / PRICE_TAG_HEIGHT)

  return tagsPerRow * tagsPerColumn
})

const totalPages = computed(() => {
  return Math.ceil(items.value.length / tagsPerPage.value)
})

const printContent = ref()
const { handlePrint } = useVueToPrint({
  content: printContent,
  documentTitle: 'Print Tags',
})

const columnDefs: ColDef[] = [
  {
    field: 'product_item_id',
    headerName: 'Артикул',
    headerClass: 'border-r',
    cellClass: 'text-center',
    maxWidth: 91,
    resizable: false,
    suppressMovable: true,
    sortable: false,
  },
  {
    field: 'product_item_name',
    headerName: 'Наименование',
    suppressMovable: true,
    sortable: false,
    valueGetter: (p) => {
      const { name } = ProductItems.findOne(
        { id: p.data.product_item_id },
        { reactive: false },
      ) as ProductItem
      return name
    },
  },
  {
    field: 'product_brand_name',
    headerName: 'Бренд',
    suppressMovable: true,
    width: 128,
    sortable: false,
    valueGetter: (p) => {
      const { product_brand_id } = ProductItems.findOne(
        { id: p.data.product_item_id },
        { reactive: false },
      ) as ProductItem
      if (product_brand_id) {
        const { name } = ProductBrands.findOne(
          { id: product_brand_id },
          { reactive: false },
        ) as ProductBrand
        return name
      }
      return ''
    },
  },
  {
    field: 'retail_price',
    headerName: 'Розничная цена',
    headerClass: 'italic',
    valueFormatter: (p) => toCurrencyPrice(p.value),
    suppressMovable: true,
    sortable: false,
    editable: true,
    cellEditor: 'price',
    cellEditorParams: {
      min: 0,
    },
  },
]

const selectedProductItemId = ref<ProductItem['id'] | null>(null)
const isProductModalVisible = ref(false)

function openProductProfile({ product_item_id }: { product_item_id: ProductItem['id'] }) {
  selectedProductItemId.value = product_item_id
  isProductModalVisible.value = true
}
</script>

<template>
  <div class="rounded-md bg-white p-4 flex flex-col gap-4">
    <StockSelect v-model:id="selectedStockId" />
    <TableEditor
      :columnDefs="columnDefs"
      :rowData="items"
      priceField="retail_price"
      editable
      hideTotal
      @removeRow="removeItemFromEditor"
      @openProductProfile="openProductProfile"
    />
    <div class="flex justify-between items-center">
      <div v-if="items.length > 0" сlass="flex flex-col">
        <span class="font-semibold">Всего: {{ items.length }}</span>
        <span> ~ {{ totalPages }} стр.</span>
      </div>
      <div class="flex gap-4 ml-auto">
        <Button
          v-if="items.length > 0"
          label="Очистить"
          icon="pi pi-eraser"
          severity="danger"
          variant="outlined"
          @click="removeAllItemsFromEditor"
        />
        <Button
          label="Печать"
          icon="pi pi-print"
          severity="primary"
          :disabled="items.length === 0"
          @click="handlePrint"
        />
      </div>
    </div>
    <div class="absolute left-[-9999px]">
      <div ref="printContent" class="flex flex-wrap">
        <template v-if="selectedStockId !== null">
          <div v-for="(item, index) in items">
            <ProductPriceTag
              :stockId="selectedStockId"
              :productItemId="item.product_item_id"
              :retailPrice="item.retail_price"
            />
            <div v-if="(index + 1) % tagsPerPage === 0" style="page-break-before: always"></div>
          </div>
        </template>
      </div>
    </div>
  </div>

  <ProductProfileDialog
    v-if="selectedProductItemId !== null"
    v-model:visible="isProductModalVisible"
    :productItemId="selectedProductItemId"
  />
</template>
