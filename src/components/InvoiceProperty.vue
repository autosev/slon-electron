<script setup lang="ts">
const props = defineProps<{
  operation: InvoiceDocumentEditor['operation']
  issueDate: InvoiceDocumentEditor['issue_date']
  senderStockId?: InvoiceExpenditureEditor['sender_stock_id']
  recipientStockId?:
    | InvoiceArrivalEditor['recipient_stock_id']
    | InvoiceExpenditureEditor['recipient_stock_id']
  vendorId?: number | null
  totalPrice?: number
  note: InvoiceDocumentEditor['note']
}>()

const { getStockById } = useOrganizationStore()
const { toCurrencyPrice } = useTools()
const { getInvoiceOperationName } = useInvoice()

function getVendorById(id: Vendor['id']): Vendor['name'] {
  const result = Vendors.findOne({ id }) as Vendor
  return result?.name || 'Не указан'
}
</script>

<template>
  <div>
    <div class="flex gap-6">
      <div class="flex flex-col">
        <span class="text-sm text-muted-color">От:</span>
        <span>{{ new Date(props.issueDate).toLocaleDateString('ru-RU') }}</span>
      </div>
      <div class="flex flex-col">
        <span class="text-sm text-muted-color">Склад:</span>
        <span v-if="typeof props.senderStockId === 'number'">
          {{ getStockById(props.senderStockId)?.address }}
        </span>
        <span v-else-if="typeof props.recipientStockId === 'number'">
          {{ getStockById(props.recipientStockId)?.address }}
        </span>
      </div>
      <div class="flex flex-col" v-if="props.operation !== null">
        <span class="text-sm text-muted-color">Операция:</span>
        <span>{{ getInvoiceOperationName(props.operation) }}</span>
      </div>
      <div v-if="typeof props.vendorId === 'number'" class="flex flex-col">
        <span class="text-sm text-muted-color">Поставщик:</span>
        <span>{{ getVendorById(props.vendorId) }}</span>
      </div>
      <div
        v-if="
          props.operation === 'expenditure_internal' && typeof props.recipientStockId === 'number'
        "
        class="flex flex-col"
      >
        <span class="text-sm text-muted-color">Склад-получатель:</span>
        <span>{{ getStockById(props.recipientStockId)?.address }}</span>
      </div>
      <div v-if="props.totalPrice !== undefined" class="flex flex-col ml-auto mt-auto">
        <span class="font-bold text-lg">{{ toCurrencyPrice(props.totalPrice) }}</span>
      </div>
    </div>
    <div v-if="props.note !== ''" class="text-xs mt-1 italic">
      <span>{{ props.note }}</span>
    </div>
  </div>
</template>
