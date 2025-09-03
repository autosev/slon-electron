<script setup lang="ts">
const props = defineProps<{ id: ProductMeasure['id'] }>()
const emit = defineEmits(['update:id'])

const productMeasureOptions = ref<ProductMeasure[]>([])

watchEffect((onCleanup) => {
  const productMeasuresCursor = ProductMeasures.find()
  productMeasureOptions.value = (productMeasuresCursor.fetch() as ProductMeasure[]) ?? []

  onCleanup(() => {
    productMeasuresCursor.cleanup()
  })
})
</script>

<template>
  <FloatLabel variant="on" class="w-fit">
    <Select
      :model-value="props.id"
      :options="productMeasureOptions"
      optionValue="id"
      optionLabel="name"
      labelId="on_product_measure"
      class="w-full"
      @update:model-value="(value) => emit('update:id', value)"
    />
    <label for="on_product_measure">Ед. изм.</label>
  </FloatLabel>
</template>
