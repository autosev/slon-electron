<script setup lang="ts">
const props = defineProps<{
  data: InvoiceArrivalDocumentEditor | InvoiceExpenditureDocumentEditor
  title: string
}>()
</script>

<template>
  <div>
    <InvoiceStatus :status="props.data.invoice.status" :created_at="props.data.created_at" simple>
      <h1 class="text-center">
        {{ props.title }} #<span class="normal-case">{{ props.data.slug }}</span>
      </h1>
    </InvoiceStatus>
    <InvoiceProperty
      :operation="props.data.operation"
      :issueDate="props.data.issue_date"
      :recipientStockId="props.data.invoice.recipient_stock_id"
      :vendorId="props.data.invoice.vendor_id"
      :senderStockId="
        'sender_stock_id' in props.data.invoice ? props.data.invoice.sender_stock_id : undefined
      "
      class="mt-3"
    />
    <div class="mt-5">
      <slot />
    </div>
    <div class="mt-5 flex justify-between">
      <div class="flex gap-3">
        <span>Отпустил</span>
        <div class="w-32 border-b border-black"></div>
      </div>
      <div class="flex gap-3">
        <span>Получил</span>
        <div class="w-32 border-b border-black"></div>
      </div>
    </div>
  </div>
</template>

<style>
@page {
  /* Устанавливаем размер страницы. Чаще всего это можно опустить, 
     браузер возьмет значение из настроек печати. */
  size: A4 portrait;
  /* Устанавливаем отступы: верх, право, низ, лево */
  margin: 15mm 20mm;
}
</style>
