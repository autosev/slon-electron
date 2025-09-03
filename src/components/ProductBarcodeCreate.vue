<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'submit', barcode: ProductBarcodeInsert): void
}>()

const type = ref<ProductBarcodeInsert['type']>('factory')
const code = ref<string>('')
const typeOptions = [
  { label: 'Заводской', value: 'factory' },
  { label: 'Внутренний', value: 'internal' },
]

function onSubmit() {
  emit('submit', { type: type.value, code: code.value })
}
</script>

<template>
  <div class="flex flex-col gap-5 mt-2">
    <FloatLabel variant="on">
      <Select
        v-model="type"
        :options="typeOptions"
        option-label="label"
        option-value="value"
        id="on_product_measure"
        fluid
      />
      <label for="on_code">Тип</label>
    </FloatLabel>
    <FloatLabel variant="on">
      <InputText v-model="code" id="on_code" fluid autofocus @keyup.enter="onSubmit" />
      <label for="on_code">Код</label>
    </FloatLabel>
    <Button label="Создать" :disabled="code.length === 0" fluid @click="onSubmit" />
  </div>
</template>
