<script lang="ts" setup>
const dayjs = useDayjs()

const { selectedStockId } = storeToRefs(useTableStore())
const { openEditor: IEOpenEditor } = useInvoiceExpenditureStore()

const stockId = ref(selectedStockId.value)
const dateRange = ref(createDateRange())

function createDateRange() {
  const end = dayjs().endOf('day') // сегодня, конец дня
  const start = end.subtract(30, 'day').startOf('day') // 30 дней назад, начало дня
  // создаём диапазон дат в локальном часовом поясе
  return [start.toDate(), end.toDate()]
}

type EmptyFilter = { $exists: true }

const invoiceExpenditureDocuments = ref<InvoiceExpenditureDocumentEditor[]>([])

const selectedInvoiceExpenditureStatus = ref<InvoiceExpenditure['status'] | EmptyFilter>({
  $exists: true,
})
const invoiceExpenditureStatusOptions = [
  {
    label: 'Все',
    value: { $exists: true },
  },
  {
    label: 'Проведена',
    value: 'completed',
  },
  {
    label: 'Аннулирована',
    value: 'reversed',
  },
  {
    label: 'На рассмотрении',
    value: 'checking',
  },
  {
    label: 'Отклонена',
    value: 'rejected',
  },
] as { label: string; value: InvoiceExpenditure['status'] | EmptyFilter }[]

const selectedInvoiceExpenditureOperation = ref<InvoiceOperation | EmptyFilter>({ $exists: true })
const invoiceExpenditureOperationOptions = [
  { label: 'Все', value: { $exists: true } },
  { label: 'Отпуск товара покупателю', value: 'expenditure_to_customer' },
  { label: 'Внутрисистемный отпуск', value: 'expenditure_internal' },
  { label: 'Возврат товара поставщику', value: 'expenditure_vendor_return' },
  { label: 'Отпуск товара персоналу', value: 'expenditure_to_employee' },
] as {
  label: string
  value: InvoiceOperation | EmptyFilter
}[]

watchEffect((onCleanup) => {
  const invoiceDocumentsCursor = InvoiceDocuments.find(
    {
      issue_date: {
        $gte: dayjs(dateRange.value.at(0)).format('YYYY-MM-DD'),
        $lte: dayjs(dateRange.value.at(1) ?? dateRange.value.at(0)).format('YYYY-MM-DD'),
      },
      operation: selectedInvoiceExpenditureOperation.value,
    },
    {
      sort: {
        issue_date: -1,
        created_at: -1,
      },
    },
  )
  const invoiceDocuments = (invoiceDocumentsCursor.fetch() as InvoiceDocument[] | undefined) ?? []

  const invoiceExpendituresCursor = InvoiceExpenditures.find(
    {
      sender_stock_id: stockId.value,
      id: {
        $in: invoiceDocuments.map(({ id }) => id),
      },
      status: selectedInvoiceExpenditureStatus.value,
    },
    {
      sort: {
        issue_date: -1,
        created_at: -1,
      },
    },
  )
  const invoiceExpenditures =
    (invoiceExpendituresCursor.fetch() as InvoiceExpenditure[] | undefined) ?? []

  const invoiceExpenditureItemsCursor = InvoiceExpenditureItems.find({
    invoice_expenditure_id: { $in: invoiceExpenditures.map(({ id }) => id) },
  })
  const invoiceExpenditureItems =
    (invoiceExpenditureItemsCursor.fetch() as InvoiceExpenditureItem[] | undefined) ?? []

  const result: InvoiceExpenditureDocumentEditor[] = []
  for (const invoiceDocument of invoiceDocuments) {
    const invoiceExpenditure = invoiceExpenditures.find(
      (invoiceExpenditure) => invoiceExpenditure.id === invoiceDocument.id,
    )
    if (invoiceExpenditure !== undefined) {
      result.push({
        ...invoiceDocument,
        invoice: invoiceExpenditure,
        items: invoiceExpenditureItems.filter(
          (item) => item.invoice_expenditure_id === invoiceExpenditure.id,
        ),
      })
    }
  }
  invoiceExpenditureDocuments.value = result

  onCleanup(() => {
    invoiceDocumentsCursor.cleanup()
    invoiceExpendituresCursor.cleanup()
    invoiceExpenditureItemsCursor.cleanup()
  })
})
</script>

<template>
  <div>
    <div class="flex gap-3">
      <DatePicker
        v-model="dateRange"
        selectionMode="range"
        :manualInput="false"
        iconDisplay="input"
        showIcon
        showButtonBar
        @clearClick="dateRange = createDateRange()"
        class="w-60"
      />
      <StockSelect v-model:id="stockId" class="min-w-32" />
      <FloatLabel variant="on">
        <Select
          v-model="selectedInvoiceExpenditureStatus"
          :options="invoiceExpenditureStatusOptions"
          scrollHeight="15rem"
          optionLabel="label"
          optionValue="value"
          labelId="on_status"
        ></Select>
        <label for="on_status">Статус</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Select
          v-model="selectedInvoiceExpenditureOperation"
          :options="invoiceExpenditureOperationOptions"
          optionLabel="label"
          optionValue="value"
          labelId="on_operation"
        ></Select>
        <label for="on_operation">Операция</label>
      </FloatLabel>
    </div>
    <div class="flex flex-col gap-3 mt-3">
      <InvoiceCard
        v-for="invoiceExpenditureDocument in invoiceExpenditureDocuments"
        :key="invoiceExpenditureDocument.id"
        :data="invoiceExpenditureDocument"
        @click="IEOpenEditor(invoiceExpenditureDocument.id)"
      />
    </div>
  </div>
</template>
