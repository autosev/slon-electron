<script lang="ts" setup>
import { ColDef } from 'ag-grid-community'
import { useVueToPrint } from 'vue-to-print'
import TableInputPrice from './TableInputPrice.vue'
import TablePackageSelect from './TablePackageSelect.vue'

const invoiceArrivalStore = useInvoiceArrivalStore()
const {
  createDraft,
  removeItemFromEditor,
  updateItemProductPackageId,
  updateItemPrice,
  updateItemQuantity,
  removeDraftConfirm,
  afterUpdateEditorDataOperation,
  createCompletedConfirm,
  createReversedConfirm,
  createСopyConfirm,
} = invoiceArrivalStore
const {
  selectedTab,
  editorData,
  editorInvoiceDocumentChildren,
  isEditable,
  isInvoiceReady,
  isInvoiceCorrection,
  isLoading,
} = storeToRefs(invoiceArrivalStore)

const { openEditor: IEOpenEditor } = useInvoiceExpenditureStore()

const dayjs = useDayjs()
const { toCurrencyPrice } = useTools()

const tableRef = ref()

const printContent = ref()
const isInvoicePrintPageVisible = ref(false)
const { handlePrint } = useVueToPrint({
  content: printContent,
  documentTitle: 'AwesomeFileName',
  onAfterPrint: () => {
    isInvoicePrintPageVisible.value = false
  },
})

const operationOptions = [
  { label: 'Приход товара от поставщика', value: 'arrival_from_vendor' },
  { label: 'Возврат товара от покупателя', value: 'arrival_customer_return' },
  { label: 'Возврат товара от персонала', value: 'arrival_employee_return' },
]

const selectedProductItemId = ref<ProductItem['id'] | null>(null)
const isProductModalVisible = ref(false)

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
    suppressMovable: true,
    sortable: false,
    editable: isEditable.value,
    cellEditor: 'agNumberCellEditor',
    cellDataType: 'number',
    cellEditorParams: {
      min: 0,
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
    //   const newValue = Number(params.newValue)

    //   if (typeof newValue === 'number' && isNaN(newValue) === false) {
    //     const selectedPackage = ProductPackages.findOne(
    //       { id: params.data.product_package_id },
    //       { reactive: false },
    //     ) as ProductPackage | undefined

    //     if (selectedPackage !== undefined) {
    //       return new Decimal(newValue)
    //         .times(new Decimal(selectedPackage.conversion_factor))
    //         .toNumber()
    //     }
    //     return newValue
    //   } else {
    //     return params.oldValue
    //   }
    // },
    valueSetter: (params) => {
      const isValueChanged = params.newValue !== params.data.quantity
      console.log(params.node?.rowIndex)
      if (isValueChanged === true && typeof params.node?.rowIndex === 'number') {
        updateItemQuantity(params.node.rowIndex, params.newValue)
      }
      return isValueChanged
    },
  },
  {
    field: 'price',
    headerName: 'Цена',
    headerClass: isEditable.value ? 'italic' : '',
    suppressMovable: true,
    sortable: false,
    editable: isEditable.value,
    cellEditor: 'agNumberCellEditor',
    cellDataType: 'number',
    cellEditorParams: {
      min: 0,
    },
    valueFormatter: (params) => toCurrencyPrice(params.value),
    valueParser: (params) => {
      const newValue = Number(params.newValue)
      return typeof newValue === 'number' && isNaN(newValue) === false ? newValue : params.oldValue
    },
    valueSetter: (params) => {
      const isValueChanged = params.newValue !== params.data.price
      if (isValueChanged === true && typeof params.node?.rowIndex === 'number') {
        updateItemPrice(params.node.rowIndex, params.newValue)
      }
      return isValueChanged
    },
  },
])

function updateIssueDate(newDate: Date | Date[] | (Date | null)[] | null | undefined) {
  editorData.value.issue_date = newDate instanceof Date ? dayjs(newDate).format('YYYY-MM-DD') : ''
}

function openProductProfile(data: InvoiceArrivalItem) {
  selectedProductItemId.value = data.product_item_id ?? null
  isProductModalVisible.value = true
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
  // ProductPackages.on('removeOne', ({ id }) => {
  //   const itemsProductPackageIds = editorData.value.items.map((item) => item.product_package_id)
  //   if (itemsProductPackageIds.includes(id) === true) {
  //     const editorDataItem = editorData.value.items.filter((item) => item.product_package_id === id)
  //     editorDataItem.forEach((item) => {
  //       const productPackage = ProductPackages.findOne(
  //         { product_item_id: item.product_item_id, name: '' },
  //         { reactive: false },
  //       ) as ProductPackage | undefined

  //       if (productPackage !== undefined) {
  //         updateItemProductPackageId(item.id, productPackage.id)
  //         tableRef.value?.refreshCells(['product_package_id'])
  //       }
  //     })
  //   }
  // })
})

defineExpose({
  TablePackageSelect,
  TableInputPrice,
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
      @open="IEOpenEditor($event)"
    />
  </InvoiceStatus>

  <div class="flex flex-col gap-5">
    <div class="flex gap-4">
      <FloatLabel variant="on">
        <DatePicker
          id="on_label"
          :model-value="new Date(editorData.issue_date)"
          iconDisplay="input"
          class="w-36"
          :disabled="!isEditable || isInvoiceCorrection === true"
          showIcon
          showButtonBar
          @update:model-value="updateIssueDate"
        />
        <label for="on_label">От</label>
      </FloatLabel>
      <StockSelect
        v-model:id="editorData.invoice.recipient_stock_id"
        :disabled="!isEditable || isInvoiceCorrection === true"
        class="min-w-32"
      />
    </div>
    <div class="flex gap-4">
      <FloatLabel variant="on">
        <Select
          id="on_label"
          v-model="editorData.operation"
          :options="operationOptions"
          :disabled="!isEditable || isInvoiceCorrection === true"
          option-label="label"
          option-value="value"
          class="w-fit min-w-52"
          @change="afterUpdateEditorDataOperation"
        />
        <label for="on_label">Операция</label>
      </FloatLabel>
      <VendorSelect
        v-if="editorData.operation === 'arrival_from_vendor'"
        v-model:id="editorData.invoice.vendor_id"
        :disabled="!isEditable"
        class="min-w-44"
      />
      <EmployeeSelect
        v-if="editorData.operation === 'arrival_employee_return'"
        v-model:id="editorData.invoice.employee_id"
        :disabled="!isEditable"
        class="min-w-44"
      />
    </div>
  </div>
  <div>
    <TableEditor
      v-if="selectedTab === 'editor'"
      :columnDefs="columnDefs"
      :rowData="editorData.items"
      :editable="isEditable"
      quantityField="quantity"
      noRowsText="В накладной не указаны позиции"
      ref="tableRef"
      @removeRow="removeItemFromEditor"
      @openProductProfile="openProductProfile"
    />
  </div>
  <div class="flex justify-between gap-4">
    <div class="w-full max-w-lg">
      <InvoiceNoteInput v-model:note="editorData.note" :disabled="!isEditable" />
      <!-- <FloatLabel variant="on">
        <InputText id="on_label" v-model="editorData.note" class="w-full" :disabled="!isEditable" />
        <label for="on_label">Комментарий</label>
      </FloatLabel> -->
    </div>
    <div class="flex gap-4 w-fit text-nowrap">
      <template v-if="isLoading === false">
        <Button
          v-if="editorData.invoice.status === 'draft'"
          label="Удалить"
          icon="pi pi-file-excel"
          severity="danger"
          variant="outlined"
          @click="removeDraftConfirm"
        />
        <template
          v-if="
            editorData.invoice.status === 'new' ||
            editorData.invoice.status === 'draft' ||
            isInvoiceCorrection === true
          "
        >
          <Button
            label="Сохранить"
            icon="pi pi-save"
            severity="primary"
            variant="outlined"
            :disabled="!isInvoiceReady"
            @click="createDraft"
          />
          <Button
            label="Провести"
            icon="pi pi-check-circle"
            :disabled="!isInvoiceReady"
            @click="createCompletedConfirm"
          />
        </template>
        <template v-if="editorData.invoice.status === 'completed'">
          <Button
            v-if="editorInvoiceDocumentChildren.length === 0"
            label="Аннулировать"
            icon="pi pi-ban"
            severity="danger"
            variant="outlined"
            @click="createReversedConfirm"
          />
        </template>
        <template v-else-if="editorData.invoice.status === 'reversed'">
          <Button
            icon="pi pi-clone"
            label="Создать копию"
            severity="primary"
            variant="outlined"
            @click="createСopyConfirm"
          />
        </template>
        <Button
          v-if="
            editorData.invoice.status === 'completed' || editorData.invoice.status === 'reversed'
          "
          label="Печать"
          icon="pi pi-print"
          severity="primary"
          variant="outlined"
          @click="print"
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
        title="Приходная накладная"
        v-if="isInvoicePrintPageVisible === true"
      >
        <TableEditor
          :columnDefs="
            columnDefs.map((col: ColDef) => ({
              ...col,
              headerClass: 'border-r border-black',
              resizable: false,
            }))
          "
          :rowData="editorData.items"
          :editable="false"
          quantityField="quantity"
          domLayout="print"
          @onGridReady="handlePrint"
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
