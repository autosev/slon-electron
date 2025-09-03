<script lang="ts" setup>
import { AgGridVue } from 'ag-grid-vue3'
import {
  ColDef,
  themeQuartz,
  iconSetMaterial,
  GridReadyEvent,
  GridApi,
  RowDoubleClickedEvent,
  IRowNode,
  SelectionChangedEvent,
} from 'ag-grid-community'
import TableBrandFilter from './TableBrandFilter.vue'
import { MenuItem } from 'primevue/menuitem'

const tableStore = useTableStore()
const { setSelectedProductItemId } = tableStore
const {
  // productItems,
  productTableItems,
  productTableShipments,
  selectedStockId,
  selectedProductItemId,
  selectedCollectionId,
  selectedTablePanel,
  selectedFilterOption,
  hasScrollToSelectedProduct,
} = storeToRefs(tableStore)

const { toCurrencyPrice } = useTools()

const props = defineProps<{ quickFilterValue: string }>()

const isArchive = computed(() => selectedCollectionId.value === null)

const rowData = computed(() => {
  // 1. Создаем Map для очень быстрого доступа к остаткам.
  // Ключ - ID товара, значение - его остаток.
  // Этот Map будет пересоздаваться только при изменении productTableShipments.
  const quantityMap = new Map(
    productTableShipments.value.map((shipment) => [
      shipment.product_item_id,
      shipment.total_quantity,
    ]),
  )

  // 2. Проходим по основному списку товаров...
  return productTableItems.value.map((item) => {
    // 3. ...и для каждого товара создаем новый объект,
    // добавляя к нему остаток из нашей Map.
    return {
      ...item,
      // Берем остаток из Map по ID товара. Если его там нет, значит остаток 0.
      quantity: quantityMap.get(item.id) ?? 0,
    }
  }) as ProductTableData[]
})

const productsCol: ComputedRef<ColDef[]> = computed(() => [
  {
    field: 'id',
    headerName: 'Артикул',
    cellClass: 'text-center',
    filter: 'agNumberColumnFilter',
    sortable: false,
    width: 120,
  },
  { field: 'name', headerName: 'Наименование', sortable: false, flex: 1, minWidth: 250 },
  {
    field: 'product_brand_name',
    headerName: 'Бренд',
    sortable: false,
    filter: TableBrandFilter,
  },
  {
    field: 'product_measure_name',
    headerName: 'Ед. изм.',
    width: 110,
  },
  {
    field: 'quantity',
    headerName: 'Остаток',
    hide: isArchive.value,
    width: 110,
  },
  {
    field: 'retail_price',
    headerName: 'Розничная цена',
    hide: isArchive.value,
    valueFormatter: (params) => {
      return toCurrencyPrice(params.value)
    },
    width: 160,
  },
])

// to use myTheme in an application, pass it to the theme grid option
const myTheme = themeQuartz.withPart(iconSetMaterial).withParams({
  borderRadius: 6,
  browserColorScheme: 'light',
  // columnBorder: true,
  fontFamily: 'inherit',
  textColor: 'var(--p-slate-700)',
  backgroundColor: '#fff',
  headerFontSize: '1rem',
  headerFontWeight: 600,
  headerHeight: 47,
  rowHeight: 32,
  wrapperBorderRadius: 0,
  borderColor: 'var(--p-slate-200)',
  rowBorder: { color: 'var(--p-slate-200)' },
  columnBorder: { color: 'var(--p-slate-200)' },
  rangeSelectionBorderColor: 'var(--p-primary-color)',
  rowHoverColor: 'var(--p-slate-100)',
  selectedRowBackgroundColor: 'var(--p-slate-200)',
})

const gridApi = ref<GridApi | null>(null)

function onGridReady(params: GridReadyEvent) {
  gridApi.value = params.api
}

function selectProductOnTable() {
  if (selectedProductItemId.value !== null) {
    const selectedData = gridApi.value!.getSelectedRows()
    if (
      selectedData.length === 0 ||
      (selectedData.length > 0 && selectedProductItemId.value !== selectedData[0].id)
    ) {
      gridApi.value!.forEachNode((node) => {
        if (node.data.id === selectedProductItemId.value && !node.isSelected()) {
          node.setSelected(true)
          if (hasScrollToSelectedProduct.value === true) {
            gridApi.value?.ensureNodeVisible(node, 'middle')
          }
        }
      })
    }
  } else if (gridApi.value !== null) {
    const selectedData = gridApi.value!.getSelectedRows()
    if (selectedData.length > 0) {
      gridApi.value!.forEachNode((node) => {
        if (node.isSelected()) {
          node.setSelected(false)
        }
      })
    }
  }
}

watch(selectedProductItemId, () => selectProductOnTable())

function onSelectionChanged({ selectedNodes }: SelectionChangedEvent<ProductTableData>) {
  if (selectedNodes !== null && selectedNodes.length > 0) {
    const selectedData = selectedNodes[0].data
    if (selectedData !== undefined && selectedData.id !== selectedProductItemId.value) {
      setSelectedProductItemId(selectedData.id)
    }
  } else if (selectedNodes === null && selectedProductItemId.value !== null) {
    setSelectedProductItemId(null)
  }
}

const isProductModalVisible = ref(false)

function openProductProfile() {
  isProductModalVisible.value = true
}

const contextMenu = ref()
const contextMenuItems = ref<MenuItem[]>([])

const invoiceArrivalStore = useInvoiceArrivalStore()
const { editorData: IAEditorData } = storeToRefs(invoiceArrivalStore)
const { addItemToEditor: IAAddItemToEditor } = invoiceArrivalStore

const invoiceExpenditureStore = useInvoiceExpenditureStore()
const { editorData: IEEditorData, isEditable: isIEEditable } = storeToRefs(invoiceExpenditureStore)
const { addItemToEditor: IEAddItemToEditor } = invoiceExpenditureStore

const priceTagStore = usePriceTagStore()
const { addItemToEditor: PTAddItemToEditor } = priceTagStore

function onCellContextMenu({ event, data }: { event: MouseEvent; data: ProductTableData }) {
  setSelectedProductItemId(data.id, false)

  const { id, retail_price } = data
  const defaultContextMenuItems = [
    {
      label: 'Открыть профиль',
      icon: 'pi pi-fw pi-pen-to-square',
      command: () => (isProductModalVisible.value = true),
    },
    {
      label: 'Создать ценник',
      icon: 'pi pi-fw pi-tag',
      command: () => {
        return PTAddItemToEditor(id, retail_price)
      },
    },
  ]

  if (isArchive.value !== true) {
    if (
      IAEditorData.value.invoice.recipient_stock_id === null ||
      selectedStockId.value === IAEditorData.value.invoice.recipient_stock_id
    ) {
      defaultContextMenuItems.push({
        label: 'Добавить в приход',
        icon: 'pi pi-fw pi-plus-circle',
        command: () => IAAddItemToEditor(id),
      })
    }

    const shipment = ProductShipments.findOne(
      { product_item_id: data.id, stock_id: selectedStockId.value, quantity: { $gt: 0 } },
      { reactive: false },
    )

    if (
      shipment !== undefined &&
      (IEEditorData.value.invoice.sender_stock_id === null ||
        selectedStockId.value === IEEditorData.value.invoice.sender_stock_id) &&
      isIEEditable.value === true
    ) {
      defaultContextMenuItems.push({
        label: 'Добавить в расход',
        icon: 'pi pi-fw pi-minus-circle',
        command: () => {
          return IEAddItemToEditor(id, retail_price)
        },
      })
    }
  }

  contextMenuItems.value = defaultContextMenuItems
  contextMenu.value.show(event)
}

function onRowDoubleClicked({ data }: RowDoubleClickedEvent<ProductTableData>) {
  if (data !== undefined) {
    const { id, retail_price } = data

    switch (selectedTablePanel.value) {
      case 'invoice-arrival':
        if (isArchive.value !== true) {
          IAAddItemToEditor(id)
        }
        break
      case 'invoice-expenditure':
        if (isArchive.value !== true) {
          IEAddItemToEditor(id, retail_price)
        }
        break
      case 'product-price-tag-editor':
        PTAddItemToEditor(id, retail_price)
        break

      default:
        openProductProfile()
        break
    }
  }
}

function isExternalFilterPresent(): boolean {
  return selectedFilterOption.value !== 'Все'
}

function doesExternalFilterPass(node: IRowNode<ProductTableData>): boolean {
  if (node && node.data) {
    const quantity = node.data.quantity

    switch (selectedFilterOption.value) {
      case 'В наличии':
        return quantity > 0
      case 'Нет на сайте':
        return quantity > 0 && node.data.is_visible_on_website === false
      default:
        return true
    }
  }
  return true
}

watch(selectedFilterOption, () => {
  if (gridApi.value !== null) {
    gridApi.value.onFilterChanged()
  }
})

watch(selectedCollectionId, () => {
  if (gridApi.value) {
    gridApi.value.ensureIndexVisible(0, 'top')
  }
})

// onMounted(() => {
//   ProductShipments.on('updateOne', ({ id }) => {
//     if (gridApi.value !== null) {
//       const shipment = ProductShipments.findOne({ id }, { reactive: false }) as
//         | ProductShipment
//         | undefined
//       if (shipment !== undefined) {
//         const rowNode = gridApi.value.getRowNode(String(shipment.product_item_id))
//         if (rowNode !== undefined) {
//           const shipments =
//             (ProductShipments.find(
//               { product_item_id: shipment.product_item_id },
//               { reactive: false },
//             ).fetch() as ProductShipment[] | undefined) ?? []
//           const totalQuantity = shipments.reduce(
//             (sum, shipment) =>
//               shipment.stock_id === selectedStockId.value ? sum + shipment.quantity : sum,
//             0,
//           )
//           rowNode.setDataValue('quantity', totalQuantity)
//         }
//       }
//     }
//   })

//   ProductPackages.on('updateOne', ({ id }) => {
//     if (gridApi.value !== null) {
//       const pkg = ProductPackages.findOne({ id }, { reactive: false }) as ProductPackage | undefined
//       if (pkg !== undefined) {
//         const rowNode = gridApi.value.getRowNode(String(pkg.product_item_id))
//         if (rowNode !== undefined) {
//           rowNode.setDataValue('retail_price', pkg.retail_price)
//         }
//       }
//     }
//   })
// })
</script>

<template>
  <!-- {{ productTableData }} -->
  <div
    v-if="selectedCollectionId === 0"
    class="flex w-full h-product-table border-l border-t border-b border-slate-200"
  >
    <EmptyCard description="Выберите коллекцию для показа остатков товара на складе." />
  </div>
  <AgGridVue
    v-else
    ref="gridOptions"
    :theme="myTheme"
    :rowData="rowData"
    :columnDefs="productsCol"
    :rowSelection="{ mode: 'singleRow', checkboxes: false, enableClickSelection: true }"
    :quickFilterText="props.quickFilterValue"
    :isExternalFilterPresent="isExternalFilterPresent"
    :doesExternalFilterPass="doesExternalFilterPass"
    :animateRows="false"
    :suppressRowTransform="true"
    :localeText="{ noRowsToShow: 'В коллекции нет подходящих товаров' }"
    :valueCache="true"
    :getRowId="({ data }) => String(data.id)"
    class="w-full h-product-table"
    @gridReady="onGridReady"
    @selectionChanged="onSelectionChanged"
    @rowDoubleClicked="onRowDoubleClicked"
    @cellContextMenu="onCellContextMenu"
  >
  </AgGridVue>
  <ContextMenu ref="contextMenu" :model="contextMenuItems" />
  <ProductProfileDialog
    v-if="selectedProductItemId !== null"
    v-model:visible="isProductModalVisible"
    :productItemId="selectedProductItemId"
  />
</template>
