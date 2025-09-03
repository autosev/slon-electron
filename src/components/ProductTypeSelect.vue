<script setup lang="ts">
const props = defineProps<{ id: number }>()
const emit = defineEmits(['update:id'])

// const tableStore = useTableStore()
// const { productTypes } = storeToRefs(tableStore)
const productTypes = ref<ProductType[]>([])

const selectedProductTypeId = computed({
  get: () => props.id,
  set: (value) => {
    emit('update:id', value)
  },
})

watchEffect((onCleanup) => {
  // SignalDB синхронизация
  const productTypesCursor = ProductTypes.find({}, { sort: { id: 1 } })
  productTypes.value = (productTypesCursor.fetch() as ProductType[]) ?? []

  onCleanup(() => {
    productTypesCursor.cleanup()
  })
})
</script>

<template>
  <FloatLabel class="w-full" variant="on">
    <Select
      v-model="selectedProductTypeId"
      :options="productTypes"
      optionValue="id"
      optionLabel="name"
      class="w-full"
      inputId="on_label"
    />
    <label for="on_label">Тип товара</label>
  </FloatLabel>
</template>
