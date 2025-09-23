<script setup lang="ts">
import { Decimal } from 'decimal.js'

const { data } = defineProps<{
  data: InvoiceArrivalDocumentEditor | InvoiceExpenditureDocumentEditor
}>()

// const dayjs = useDayjs()
// const { getEmployeeFullName } = useTools()

const totalPrice = computed(() => {
  let result = new Decimal(0)

  data.items.forEach((item) => {
    let priceValue: Decimal

    if ('price' in item) {
      priceValue = new Decimal(item.price).times(item.quantity)
    } else {
      priceValue = new Decimal(item.retail_price).times(item.quantity)
    }

    result = result.plus(priceValue)
  })

  return result.toNumber()
})
</script>

<template>
  <div
    class="border rounded p-3 border-surface bg-surface hover:border-surface-400 dark:hover:border-surface-500 cursor-pointer"
  >
    <InvoiceStatus
      :status="data.invoice.status"
      :created_at="data.created_at"
      :created_by="data.created_by"
    >
      <InvoiceSlug
        :id="data.id"
        :slug="data.slug"
        :parent_id="data.parent_id"
        :copyToClipboard="false"
      />
    </InvoiceStatus>
    <InvoiceProperty
      :operation="data.operation"
      :issueDate="data.issue_date"
      :recipientStockId="data.invoice.recipient_stock_id"
      :vendorId="data.invoice.vendor_id"
      :senderStockId="'sender_stock_id' in data.invoice ? data.invoice.sender_stock_id : undefined"
      :note="data.note"
      :totalPrice="totalPrice"
      class="pt-3"
    />
  </div>
</template>
