<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'submit', name: ProductPackage['name']): void
}>()

const name = ref<string>('')
</script>

<template>
  <div class="flex flex-col gap-5 mt-1">
    <FloatLabel variant="on">
      <InputText v-model="name" fluid autofocus @keyup.enter="emit('submit', name)" />
      <label for="on_product_measure">Название</label>
    </FloatLabel>
    <Button label="Создать" :disabled="name.length === 0" fluid @click="emit('submit', name)" />
  </div>
</template>
