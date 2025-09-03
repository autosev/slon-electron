<script lang="ts" setup>
import { ColDef, ICellRendererParams } from 'ag-grid-community'
import TablePackageSelect from './TablePackageSelect.vue'
import { Decimal } from 'decimal.js'
import IEDiscountCreate from './IEDiscountCreate.vue'

const invoiceExpenditureStore = useInvoiceExpenditureStore()
const {
  createDraft,
  removeDraftConfirm,
  removeItemFromEditor,
  afterUpdateEditorDataType,
  updateItemProductPackageId,
  updateItemRetailPrice,
  updateItemQuantity,
  createCompletedConfirm,
} = invoiceExpenditureStore
const {
  selectedTab,
  editorData,
  editorInvoiceDocumentChildren,
  isInvoiceReady,
  isEditable,
  isInvoiceCorrection,
  isLoading,
} = storeToRefs(invoiceExpenditureStore)
const { openEditor: IAOpenEditor } = useInvoiceArrivalStore()

const { hasCurrentUserPermission } = useClientStore()

const dayjs = useDayjs()
const dialog = useDialog()

const { toCurrencyPrice } = useTools()

const tableRef = ref()

const printContent = ref()
const isInvoicePrintPageVisible = ref(false)
const { handlePrint } = useVueToPrint({
  content: printContent,
  documentTitle: 'Invoice Expenditure',
  onAfterPrint: () => {
    isInvoicePrintPageVisible.value = false
  },
})
const typeOptions = [
  { label: 'Отпуск товара покупателю', value: 'expenditure_to_customer' },
  { label: 'Внутрисистемный отпуск', value: 'expenditure_internal' },
  { label: 'Возврат товара поставщику', value: 'expenditure_vendor_return' },
  { label: 'Отпуск товара персоналу', value: 'expenditure_to_employee' },
]

const invoiceShipmentsAvailability = ref<boolean[]>([])

const areInvoiceShipmentsAvailable = computed(
  () => !invoiceShipmentsAvailability.value.includes(false),
)

const isProductModalVisible = ref(false)
const selectedProductItemId = ref<ProductItem['id'] | null>(null)

const columnDefs: ComputedRef<ColDef[]> = computed(() => [
  {
    field: 'product_item_id',
    headerName: 'Артикул',
    headerClass: 'border-r',
    cellClass: 'text-center',
    maxWidth: 91,
    resizable: false,
    suppressMovable: true,
    sortable: false,
    valueGetter: (p) => {
      const { id } = ProductItems.findOne(
        { id: p.data.product_item_id },
        { reactive: false },
      ) as ProductItem
      return id
    },
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
      const { name } = ProductBrands.findOne(
        { id: product_brand_id },
        { reactive: false },
      ) as ProductBrand
      return name
    },
  },
  {
    field: 'product_package_id',
    headerName: 'Ед. изм.',
    headerClass: isEditable.value ? 'italic' : '',
    suppressMovable: true,
    sortable: false,
    editable: isEditable.value,
    cellEditor: 'TablePackageSelect',
    valueFormatter: (p) => {
      let productPackage = ProductPackages.findOne(
        { id: p.data.product_package_id },
        { reactive: false },
      ) as ProductPackage | undefined

      if (productPackage === undefined) {
        productPackage = ProductPackages.findOne(
          { product_item_id: p.data.product_item_id, name: '' },
          { reactive: false },
        ) as ProductPackage | undefined
      }

      if (productPackage !== undefined && productPackage.name !== '') {
        return productPackage.name
      } else {
        // Если упаковка была удалена, то присваиваем id базовой единицы
        if (
          productPackage !== undefined &&
          productPackage.id !== p.data.product_package_id &&
          p.node?.rowIndex
        ) {
          updateItemProductPackageId(p.node.rowIndex, productPackage.id)
        }
        const { product_measure_id } = ProductItems.findOne(
          { id: p.data.product_item_id },
          { reactive: false },
        ) as ProductItem
        const { name: measureName } = ProductMeasures.findOne(
          { id: product_measure_id },
          { reactive: false },
        ) as ProductMeasure
        return measureName
      }
    },
    valueSetter: (params) => {
      const isValueChanged = params.newValue !== params.data.product_package_id
      if (isValueChanged === true && typeof params.node?.rowIndex === 'number') {
        updateItemProductPackageId(params.node.rowIndex, params.newValue)
      }
      return isValueChanged
    },
  },
  {
    field: 'quantity',
    headerName: 'Кол-во',
    headerClass: isEditable.value ? 'italic' : '',
    cellClass: (p) => {
      if (isEditable.value) {
        const shipment = ProductShipments.findOne(
          { id: p.data.product_shipment_id },
          { reactive: false },
        ) as ProductShipment | undefined
        const productPackage = ProductPackages.findOne(
          { id: p.data.product_package_id },
          { reactive: false },
        ) as ProductPackage | undefined

        if (shipment !== undefined && productPackage !== undefined) {
          invoiceShipmentsAvailability.value[p.rowIndex] =
            shipment.quantity >= p.data.quantity * productPackage?.conversion_factor
          if (invoiceShipmentsAvailability.value[p.rowIndex] === false) {
            return 'bg-rose-200'
          }
        }
      }
      return ''
    },
    suppressMovable: true,
    sortable: false,
    editable: editorData.value.invoice.status !== 'completed',
    cellEditor: 'agNumberCellEditor',
    cellDataType: 'number',
    cellEditorParams: {
      min: 0,
      step: 1,
    },
    valueSetter: (params) => {
      const isValueChanged = params.newValue !== params.data.quantity
      if (isValueChanged === true && typeof params.node?.rowIndex === 'number') {
        updateItemQuantity(params.node.rowIndex, params.newValue)
      }
      return isValueChanged
    },
    // valueGetter: (p) => {
    //   const selectedPackage = ProductPackages.findOne(
    //     { id: p.data.product_package_id },
    //     { reactive: false },
    //   ) as ProductPackage | undefined
    //   if (selectedPackage !== undefined) {
    //     return new Decimal(p.data.quantity)
    //       .dividedBy(new Decimal(selectedPackage.conversion_factor))
    //       .toNumber()
    //   } else {
    //     return p.data.quantity
    //   }
    // },
    // valueParser: (params) => {
    //   // params.newValue - это то, что ввёл пользователь в редактор
    //   const selectedPackage = ProductPackages.findOne(
    //     { id: params.data.product_package_id },
    //     { reactive: false },
    //   ) as ProductPackage | undefined

    //   if (selectedPackage !== undefined) {
    //     return new Decimal(params.newValue)
    //       .times(new Decimal(selectedPackage.conversion_factor))
    //       .toNumber()
    //   }
    //   return Number(params.newValue)
    // },
  },
  {
    field: 'retail_price',
    headerName: 'Цена продажи',
    headerClass: isEditable.value ? 'italic' : '',
    // valueFormatter: (p) => toCurrencyPrice(p.value),
    suppressMovable: true,
    sortable: false,
    editable: true,
    cellEditor: 'price',
    hide: editorData.value.operation !== 'expenditure_to_customer',
    cellEditorParams: {
      min: 0,
    },
    cellRenderer: (params: ICellRendererParams) => {
      let result = toCurrencyPrice(params.value)
      if (isEditable.value === true) {
        const pkg = ProductPackages.findOne(
          { id: params.data.product_package_id },
          { reactive: false },
        ) as ProductPackage | undefined

        if (pkg !== undefined) {
          if (params.data.retail_price > pkg.retail_price) {
            result += ' <i class="pi pi-sort-up-fill text-green-500"></i>'
          } else if (params.data.retail_price < pkg.retail_price) {
            result += ' <i class="pi pi-sort-down-fill text-red-500"></i>'
          }
        }
      }
      return result
    },
    valueSetter: (params) => {
      const isValueChanged = params.newValue !== params.data.retail_price
      if (
        isValueChanged === true &&
        params.node?.rowIndex &&
        typeof params.node?.rowIndex === 'number'
      ) {
        updateItemRetailPrice(params.node.rowIndex, params.newValue)
      }
      return isValueChanged
    },
  },
  {
    field: 'price',
    headerName: 'Цена партии',
    valueGetter: (params) => {
      const shipment = ProductShipments.findOne(
        {
          id: params.data.product_shipment_id,
        },
        { reactive: false },
      ) as ProductShipment
      return shipment.price ?? 0
    },
    valueFormatter: (params) => {
      return toCurrencyPrice(params.value)
    },
    suppressMovable: true,
    sortable: false,
    editable: false,
    hide:
      editorData.value.operation === null ||
      editorData.value.operation === 'expenditure_to_customer',
  } as ColDef,
])

const contextMenuEditableItems = computed(() =>
  editorData.value.operation === 'expenditure_to_customer'
    ? [
        {
          label: 'Сделать скидку',
          icon: 'pi pi-fw pi-gift',
          submit: (data: InvoiceExpenditureItem, rowIndex: number) => {
            const dialogRef = dialog.open(
              h(IEDiscountCreate, {
                productItemId: data.product_item_id,
                productPackageId: data.product_package_id,
                price: data.retail_price,
                onSubmit: (newRetailPrice) => {
                  updateItemRetailPrice(rowIndex, newRetailPrice)
                  dialogRef.close()
                },
              }),
              {
                props: {
                  modal: true,
                  header: 'Создание скидки',
                  style: { width: '300px' },
                  draggable: false,
                },
              },
            )
          },
        },
      ]
    : [],
)

function updateIssueDate(newDate: Date | Date[] | (Date | null)[] | null | undefined) {
  editorData.value.issue_date = newDate instanceof Date ? dayjs(newDate).format('YYYY-MM-DD') : ''
}

function openProductProfile(data: InvoiceExpenditureItem) {
  if (data.product_shipment_id !== undefined) {
    const { product_item_id } = ProductShipments.findOne(
      {
        id: data.product_shipment_id,
      },
      { reactive: false },
    ) as ProductShipment
    if (product_item_id !== undefined) {
      const { id } = ProductItems.findOne(
        { id: product_item_id },
        { reactive: false },
      ) as ProductItem
      selectedProductItemId.value = id ?? null
      isProductModalVisible.value = true
    }
  }
}

function print() {
  isInvoicePrintPageVisible.value = true
  requestAnimationFrame(() => {
    // Ждем еще один кадр, для гарантии что перерисовка завершилась
    requestAnimationFrame(() => {
      handlePrint()
    })
  })
}

onMounted(() => {
  ProductItems.on('updateOne', () => {
    tableRef.value?.refreshCells(['product_item_name', 'product_brand_name'])
  })
  ProductShipments.on('updateOne', () => {
    tableRef.value?.refreshCellStyles()
  })
})

defineExpose({
  TablePackageSelect,
})
</script>

<template>
  <!-- {{ editorData }} -->
  <InvoiceStatus
    :status="editorData.invoice.status"
    :created_at="editorData.created_at"
    :created_by="editorData.created_by"
  >
    <HintMessage
      v-if="
        editorData.invoice.status === 'new' &&
        isInvoiceCorrection === false &&
        editorData.items.length === 0
      "
      content="Используйте двойной клик по основной таблице для добавления позиций в накладную."
    />
    <InvoiceSlug
      v-else
      :id="editorData.id"
      :slug="editorData.slug"
      :parent_id="editorData.parent_id"
      @open="IAOpenEditor($event)"
    />
  </InvoiceStatus>

  <div class="flex gap-4">
    <FloatLabel variant="on">
      <DatePicker
        id="on_label"
        :model-value="new Date(editorData.issue_date)"
        iconDisplay="input"
        class="w-36"
        :disabled="!isEditable"
        showIcon
        showButtonBar
        @update:model-value="updateIssueDate"
      />
      <label for="on_label">От</label>
    </FloatLabel>
    <StockSelect
      v-model:id="editorData.invoice.sender_stock_id"
      :disabled="editorData.items.length > 0"
      class="min-w-32"
    />
  </div>
  <div class="flex gap-4">
    <FloatLabel variant="on">
      <Select
        id="on_label"
        v-model="editorData.operation"
        :options="typeOptions"
        :disabled="!isEditable"
        option-label="label"
        option-value="value"
        class="w-fit min-w-52"
        @change="afterUpdateEditorDataType"
      />
      <label for="on_label">Операция</label>
    </FloatLabel>
    <VendorSelect
      v-if="editorData.operation === 'expenditure_vendor_return'"
      v-model:id="editorData.invoice.vendor_id"
      :disabled="!isEditable"
      class="min-w-44"
    />
    <StockSelect
      v-if="editorData.operation === 'expenditure_internal'"
      v-model:id="editorData.invoice.recipient_stock_id"
      :disabled="!isEditable"
      :optionDisabled="(data: Stock) => data.id === editorData.invoice.sender_stock_id"
      label="Склад-получатель"
      class="min-w-48"
    />
    <EmployeeSelect
      v-if="editorData.operation === 'expenditure_to_employee'"
      v-model:id="editorData.invoice.employee_id"
      :disabled="!isEditable"
      class="min-w-44"
    />
  </div>
  <div>
    <TableEditor
      v-if="selectedTab === 'editor'"
      :columnDefs="columnDefs"
      :rowData="editorData.items"
      :hideTotal="editorData.operation === null"
      :priceField="editorData.operation === 'expenditure_to_customer' ? 'retail_price' : 'price'"
      :contextMenuEditableItems="contextMenuEditableItems"
      quantityField="quantity"
      :editable="isEditable"
      noRowsText="В накладной не указаны позиции"
      ref="tableRef"
      @removeRow="removeItemFromEditor"
      @openProductProfile="openProductProfile"
    />
  </div>
  <div class="flex justify-between gap-4">
    <div class="w-full max-w-lg">
      <InvoiceNoteInput v-model:note="editorData.note" :disabled="!isEditable" />
    </div>
    <div class="flex gap-4">
      <template v-if="editorData.invoice.status === 'reversed'">
        <Button icon="pi pi-clone" label="Создать копию" severity="primary" variant="outlined" />
      </template>
      <template
        v-if="editorData.invoice.status === 'completed' || editorData.invoice.status === 'reversed'"
      >
        <Button
          label="Печать"
          icon="pi pi-print"
          severity="primary"
          variant="outlined"
          @click="print"
        />
      </template>
      <template v-if="isLoading === false">
        <Button
          v-if="editorData.invoice.status === 'draft'"
          label="Удалить"
          icon="pi pi-file-excel"
          severity="danger"
          variant="outlined"
          @click="removeDraftConfirm"
        />
        <Button
          v-if="editorData.invoice.status === 'new' || editorData.invoice.status === 'draft'"
          label="Сохранить"
          icon="pi pi-save"
          severity="primary"
          variant="outlined"
          :disabled="!isInvoiceReady"
          @click="createDraft"
        />

        <template v-if="editorData.operation === 'expenditure_internal'">
          <template
            v-if="editorData.invoice.status === 'new' || editorData.invoice.status === 'draft'"
          >
            <Button
              v-if="hasCurrentUserPermission('invoice_expenditure.process.checked') === true"
              label="Провести"
              icon="pi pi-check-circle"
              :disabled="!isInvoiceReady || !areInvoiceShipmentsAvailable"
              @click=""
            />
            <Button
              v-else
              label="Сформировать"
              icon="pi pi-check"
              severity="contrast"
              variant="outlined"
              :disabled="!isInvoiceReady || !areInvoiceShipmentsAvailable"
              @click=""
            />
          </template>
          <template v-else-if="editorData.invoice.status === 'prior'">
            <template
              v-if="hasCurrentUserPermission('invoice_expenditure.process.checked') === true"
            >
              <Button
                label="Отменить"
                icon="pi pi-ban"
                severity="danger"
                variant="outlined"
                @click=""
              />
              <Button
                label="Провести"
                icon="pi pi-check-circle"
                :disabled="!isInvoiceReady || !areInvoiceShipmentsAvailable"
                @click=""
              />
            </template>
            <Message v-else size="small" icon="pi pi-question-circle" severity="info">
              После внесения правок она будет проведена или отменена.
            </Message>
          </template>
        </template>
        <Button
          v-else-if="editorData.invoice.status === 'new' || editorData.invoice.status === 'draft'"
          label="Провести"
          icon="pi pi-check-circle"
          :disabled="!isInvoiceReady || !areInvoiceShipmentsAvailable"
          @click="createCompletedConfirm"
        />
      </template>
      <template v-else>
        <!-- Сообщение об отправке запроса на создание накладной в БД -->
        <Message size="small" icon="pi pi-cloud-upload" severity="secondary">
          Отправка накладной
          <ProgressBar mode="indeterminate" style="height: 6px"></ProgressBar>
        </Message>
      </template>
    </div>
  </div>

  <div class="absolute left-[-9999px]">
    <div ref="printContent">
      <InvoicePrintPage
        :data="editorData"
        title="Расходная накладная"
        v-if="isInvoicePrintPageVisible === true"
      >
        <TableEditor
          :columnDefs="
            columnDefs.slice(1).map((col: ColDef) => ({
              ...col,
              headerClass: 'border-r border-black',
              resizable: false,
            }))
          "
          :rowData="editorData.items"
          :editable="false"
          quantityField="quantity"
          domLayout="print"
        />
      </InvoicePrintPage>
    </div>
  </div>

  <ProductProfileDialog
    v-if="selectedProductItemId !== null"
    v-model:visible="isProductModalVisible"
    :productItemId="selectedProductItemId"
  />
</template>
