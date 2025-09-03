<script lang="ts" setup>
import { AgGridVue } from 'ag-grid-vue3'
import {
  ColDef,
  themeQuartz,
  iconSetMaterial,
  GridReadyEvent,
  GridApi,
  CellContextMenuEvent,
  RowClassParams,
  DomLayoutType,
} from 'ag-grid-community'
import { Decimal } from 'decimal.js'
import { MenuItem } from 'primevue/menuitem'

const props = withDefaults(
  defineProps<{
    columnDefs: ColDef[]
    rowData: object[]
    editable?: boolean
    quantityField?: string
    priceField?: string
    hideTotal?: boolean
    domLayout?: DomLayoutType
    noRowsText?: string
    contextMenuEditableItems?: MenuItem[]
  }>(),
  {
    editable: false,
    priceField: 'price',
    hideTotal: false,
    domLayout: 'autoHeight',
    noRowsText: 'Пока пусто',
    contextMenuEditableItems: () => [],
  },
)
const emit = defineEmits<{
  (e: 'removeRow', index: number): void
  (e: 'openProductProfile', data: any): void
}>()

const contextMenu = ref()
const contextMenuItems = ref<MenuItem[]>([])

// const isProductModalVisible = ref(false)
// const selectedProductItemId = ref<ProductItem['id'] | null>(null)

const { toCurrencyPrice } = useTools()

const editorTheme = themeQuartz.withPart(iconSetMaterial).withParams({
  borderRadius: 6,
  browserColorScheme: 'light',
  columnBorder: true,
  fontFamily: 'inherit',
  textColor: 'var(--p-slate-700)',
  backgroundColor: '#fff',
  headerFontSize: '1rem',
  headerFontWeight: 600,
  headerHeight: 32,
  rowHeight: 32,
  wrapperBorderRadius: 0,
  borderColor: 'var(--p-slate-200)',
  rangeSelectionBorderColor: 'var(--p-primary-color)',
  rowHoverColor: 'transparent',
  selectedRowBackgroundColor: 'var(--p-slate-100)',
})

const printTheme = themeQuartz.withPart(iconSetMaterial).withParams({
  borderRadius: 0,
  browserColorScheme: 'light',
  columnBorder: true,
  fontFamily: 'inherit',
  textColor: '#000',
  backgroundColor: '#fff',
  headerFontSize: '1rem',
  headerFontWeight: 600,
  headerHeight: 32,
  rowHeight: 32,
  wrapperBorderRadius: 0,
  borderColor: '#000',
  rowHoverColor: 'transparent',
  cellHorizontalPadding: 4,
})

const columnDefs: ComputedRef<ColDef[]> = computed(() => [
  {
    headerName: '#',
    valueGetter: 'node.rowIndex + 1',
    headerClass:
      props.domLayout === 'print'
        ? 'ag-header-index border-r border-black'
        : 'ag-header-index bg-slate-100 border-r',
    cellClass: props.domLayout === 'print' ? 'text-center' : 'text-center bg-slate-100',
    maxWidth: 54,
    suppressMovable: true,
    resizable: false,
    sortable: false,
  },
  ...props.columnDefs,
  {
    field: 'priceSum',
    headerName: 'Сумма',
    valueGetter: (p) => {
      if (props.quantityField !== undefined) {
        const quantityValue = p.getValue(props.quantityField)
        const priceValue = p.getValue(props.priceField)

        return new Decimal(priceValue).times(quantityValue)
      } else {
        return 0
      }
    },
    valueFormatter: (p) => toCurrencyPrice(p.value),
    resizable: props.domLayout !== 'print',
    suppressMovable: true,
    sortable: false,
    hide: props.hideTotal,
  },
])

const gridApi = ref<GridApi | null>(null)
const totalPrice = ref(0)
const totalQuantity = ref(0)

function onGridReady(params: GridReadyEvent) {
  gridApi.value = params.api
  gridApi.value.autoSizeAllColumns()
  updateTotal()
}

function onRowDataUpdated() {
  if (gridApi.value !== null) {
    updateTotal()
    gridApi.value.autoSizeAllColumns()
  }
}

function refreshCellStyles() {
  gridApi.value?.refreshCells({
    force: true,
  })
}

function refreshCells(columns: string[]) {
  gridApi.value?.refreshCells({ columns })
}

function onCellContextMenu({ event, data, rowIndex }: CellContextMenuEvent) {
  if (rowIndex !== null && gridApi.value !== null) {
    gridApi.value.getDisplayedRowAtIndex(rowIndex)?.setSelected(true, true)

    const defaultContextMenuItems = [
      {
        label: 'Открыть профиль',
        icon: 'pi pi-fw pi-pen-to-square',
        command: () => {
          emit('openProductProfile', data)
          // selectedProductItemId.value = data.product_item_id ?? data.
          // isProductModalVisible.value = true
        },
      },
    ]

    if (props.editable === true) {
      // console.log(props.contextMenuEditableItems)
      const contextMenuEditableItems = props.contextMenuEditableItems.map((item) => ({
        label: item.label,
        icon: item.icon,
        command: () => item.submit(data, rowIndex),
      }))
      contextMenuItems.value = [
        ...defaultContextMenuItems,
        ...contextMenuEditableItems,
        {
          label: 'Удалить строку',
          icon: 'pi pi-fw pi-times-circle',
          command: () => emit('removeRow', rowIndex),
        },
      ]
    } else {
      contextMenuItems.value = defaultContextMenuItems
    }
    contextMenu.value.show(event)
  }
}

function updateTotal() {
  if (gridApi.value !== null && props.hideTotal === false) {
    let priceResult = new Decimal(0)
    let quantityResult = new Decimal(0)

    gridApi.value!.forEachNode((node) => {
      if (node.data.status !== 'error' && node.data.status !== 'waiting') {
        const priceValue = gridApi.value!.getCellValue({
          rowNode: node,
          colKey: 'priceSum',
          useFormatter: false,
        })
        priceResult = priceResult.plus(priceValue)

        if (props.quantityField !== undefined) {
          const quantityValue = gridApi.value!.getCellValue({
            rowNode: node,
            colKey: props.quantityField,
            useFormatter: false,
          })
          quantityResult = quantityResult.plus(quantityValue)
        }
      }
    })
    totalPrice.value = priceResult.toNumber()
    totalQuantity.value = quantityResult.toNumber()
  }
}

function getRowClass(params: RowClassParams) {
  if (params.data.status === 'error') {
    return 'text-slate-500 bg-red-50'
  } else if (params.data.status === 'waiting') {
    return 'text-slate-500 bg-orange-50'
  } else {
    return ''
  }
}

watch(
  () => props.priceField,
  () => updateTotal(),
)

defineExpose({
  refreshCellStyles,
  refreshCells,
})
</script>

<template>
  <AgGridVue
    ref="gridOptions"
    :theme="props.domLayout === 'print' ? printTheme : editorTheme"
    :rowData="props.rowData"
    :columnDefs="columnDefs"
    :domLayout="props.domLayout"
    :rowSelection="{ mode: 'singleRow', checkboxes: false, enableClickSelection: true }"
    :autoSizeStrategy="{ type: 'fitCellContents' }"
    :animateRows="false"
    :localeText="{ noRowsToShow: props.noRowsText }"
    :getRowClass="getRowClass"
    :class="{ 'ag-print': props.domLayout === 'print' }"
    @gridReady="onGridReady"
    @cellValueChanged="updateTotal"
    @rowDataUpdated="onRowDataUpdated"
    @rowValueChanged="updateTotal"
    @cellContextMenu="onCellContextMenu"
  >
  </AgGridVue>
  <ContextMenu ref="contextMenu" :model="contextMenuItems" />
  <div v-if="hideTotal === false" class="flex justify-between items-center h-[32px] font-semibold">
    <span>
      <template v-if="props.quantityField !== undefined && totalQuantity > 0">
        Общее количество: {{ totalQuantity }}
      </template>
    </span>
    <span>Итого: {{ toCurrencyPrice(totalPrice) }} </span>
  </div>
</template>

<style>
.ag-print .ag-center-cols-viewport {
  min-height: unset !important;
}

.ag-print .ag-center-cols-container {
  min-height: unset !important;
}

.ag-header-index .ag-header-cell-label {
  justify-content: center;
}
</style>
