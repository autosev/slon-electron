<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'open', invoice: InvoiceArrivalDocumentEditor): void
}>()

const dayjs = useDayjs()

const { selectedStockId } = storeToRefs(useTableStore())
const { openEditor: IAOpenEditor } = useInvoiceArrivalStore()

const stockId = ref(selectedStockId.value)
const dateRange = ref(createDateRange())

function createDateRange() {
  const end = dayjs().endOf('day') // сегодня, конец дня
  const start = end.subtract(30, 'day').startOf('day') // 30 дней назад, начало дня
  // создаём диапазон дат в локальном часовом поясе
  return [start.toDate(), end.toDate()]
}

type EmptyFilter = { $exists: true }

const invoiceArrivalDocuments = ref<InvoiceArrivalDocumentEditor[]>([])

const selectedInvoiceArrivalStatus = ref<InvoiceArrival['status'] | EmptyFilter>({ $exists: true })
const invoiceArrivalStatusOptions = [
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
] as { label: string; value: InvoiceArrival['status'] | EmptyFilter }[]

const selectedInvoiceArrivalOperation = ref<InvoiceOperation | EmptyFilter>({ $exists: true })
const invoiceArrivalOperationOptions = [
  {
    label: 'Все',
    value: { $exists: true },
  },
  {
    label: 'Приход товара от поставщика',
    value: 'arrival_from_vendor',
  },
  {
    label: 'Возврат товара от покупателя',
    value: 'arrival_customer_return',
  },
  {
    label: 'Возврат товара от персонала',
    value: 'arrival_employee_return',
  },
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
      operation: selectedInvoiceArrivalOperation.value,
    },
    {
      sort: {
        issue_date: -1,
        created_at: -1,
      },
    },
  )
  const invoiceDocuments = (invoiceDocumentsCursor.fetch() as InvoiceDocument[] | undefined) ?? []

  const invoiceArrivalsCursor = InvoiceArrivals.find(
    {
      recipient_stock_id: stockId.value,
      id: {
        $in: invoiceDocuments.map(({ id }) => id),
      },
      status: selectedInvoiceArrivalStatus.value,
    },
    {
      sort: {
        issue_date: -1,
        created_at: -1,
      },
    },
  )
  const invoiceArrivals = (invoiceArrivalsCursor.fetch() as InvoiceArrival[] | undefined) ?? []

  const invoiceArrivalItemsCursor = InvoiceArrivalItems.find({
    invoice_arrival_id: { $in: invoiceArrivals.map(({ id }) => id) },
  })
  const invoiceArrivalItems =
    (invoiceArrivalItemsCursor.fetch() as InvoiceArrivalItem[] | undefined) ?? []

  const result: InvoiceArrivalDocumentEditor[] = []
  for (const invoiceDocument of invoiceDocuments) {
    const invoiceArrival = invoiceArrivals.find(
      (invoiceArrival) => invoiceArrival.id === invoiceDocument.id,
    )
    if (invoiceArrival !== undefined) {
      result.push({
        ...invoiceDocument,
        invoice: invoiceArrival,
        items: invoiceArrivalItems.filter((item) => item.invoice_arrival_id === invoiceArrival.id),
      })
    }
  }
  invoiceArrivalDocuments.value = result

  onCleanup(() => {
    invoiceDocumentsCursor.cleanup()
    invoiceArrivalsCursor.cleanup()
    invoiceArrivalItemsCursor.cleanup()
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
        class="w-60"
        @clearClick="dateRange = createDateRange()"
      />
      <StockSelect v-model:id="stockId" class="min-w-32" />
      <FloatLabel variant="on">
        <Select
          v-model="selectedInvoiceArrivalStatus"
          :options="invoiceArrivalStatusOptions"
          optionLabel="label"
          optionValue="value"
          labelId="on_status"
        ></Select>
        <label for="on_status">Статус</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Select
          v-model="selectedInvoiceArrivalOperation"
          :options="invoiceArrivalOperationOptions"
          optionLabel="label"
          optionValue="value"
          labelId="on_operation"
        ></Select>
        <label for="on_operation">Операция</label>
      </FloatLabel>
    </div>
    <div class="flex flex-col gap-3 mt-3">
      <InvoiceCard
        v-for="invoiceArrivalDocument in invoiceArrivalDocuments"
        :key="invoiceArrivalDocument.id"
        :data="invoiceArrivalDocument"
        @click="IAOpenEditor(invoiceArrivalDocument.id)"
      />
    </div>
  </div>
</template>
