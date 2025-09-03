<script lang="ts" setup>
const emit = defineEmits(['submited'])

const name = ref('')

function onSubmit() {
  const productBrandResult = Vendors.findOne({ name: name.value }, { reactive: false })
  if (productBrandResult === undefined) {
    Vendors.insert({ name: name.value })
  }
  emit('submited')
}
</script>

<template>
  <FloatLabel class="my-2" variant="on">
    <InputText type="text" v-model="name" fluid autofocus @keyup.enter="onSubmit" />
    <label for="on_label">Название</label>
  </FloatLabel>
  <Button class="mt-3" label="Создать" :disabled="!name" @click="onSubmit" fluid />
</template>
