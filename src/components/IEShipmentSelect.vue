<script setup lang="ts">
const props = defineProps<{ productItemId: ProductItem['id']; shipments: ProductShipment[] }>()
const emit = defineEmits<{
  (e: 'select', product_shipment_id: ProductShipment['id']): void
}>()

const { toCurrencyPrice } = useTools()

const selectedShipmentId = ref(props.shipments.at(0)?.id ?? null)
const isMessageVisible = ref(true)

const productItemMeasureName = computed(() => {
  const productItem = ProductItems.findOne({ id: props.productItemId }, { reactive: false }) as
    | ProductItem
    | undefined
  if (productItem !== undefined) {
    return (
      (
        ProductMeasures.findOne({ id: productItem.product_measure_id }, { reactive: false }) as
          | ProductMeasure
          | undefined
      )?.name ?? ''
    )
  } else {
    return ''
  }
})

function submit() {
  if (selectedShipmentId.value !== null) {
    emit('select', selectedShipmentId.value)
  }
}
</script>

<template>
  <div>
    <Message v-if="isMessageVisible" size="small" class="mt-1 mb-3" icon="pi pi-question-circle">
      Нажмите Enter для быстрого выбора партии товара на складе.
    </Message>
    <Listbox
      v-model="selectedShipmentId"
      :options="props.shipments"
      optionValue="id"
      :highlightOnSelect="false"
      class="w-full"
      checkmark
    >
      <template #option="{ option }">
        <div class="w-full">
          <div class="flex justify-between font-semibold">
            <span> {{ option.quantity }} {{ productItemMeasureName }} </span>
            <span>
              {{ toCurrencyPrice(option.price) }}
            </span>
          </div>
          <div class="flex items-center gap-2 mt-2 text-xs">
            <i class="pi pi-calendar !text-xs"></i>
            <span>
              {{
                option.arrival_date
                  ? new Date(option.arrival_date).toLocaleDateString('ru-RU')
                  : 'Нет даты поступления'
              }}
            </span>
          </div>
        </div>
      </template>
    </Listbox>
    <Button
      label="Подтвердить"
      fluid
      autofocus
      class="mt-3"
      :disabled="selectedShipmentId === null"
      @click="submit"
      @focusout="isMessageVisible = false"
    />
  </div>
</template>
