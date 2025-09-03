<script lang="ts" setup>
const emit = defineEmits(['submited'])

const { supabase } = useSupabase()
const toast = useToast()

const name = ref('')

async function submit() {
  const { data, error } = await supabase
    .from('product_brand')
    .insert({ name: name.value })
    .select('id')

  if (error === null && data !== null) {
    toast.add({
      severity: 'success',
      summary: 'Успешно',
      detail: `Новый бренд успешно добавлен.`,
      life: 3000,
    })
    emit('submited', data.at(0)?.id)
  } else {
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: `Не удалось добавить новый бренд.`,
      life: 3000,
    })
  }
}
</script>

<template>
  <FloatLabel class="my-2" variant="on">
    <InputText type="text" v-model="name" fluid autofocus @keyup.enter="submit" />
    <label for="on_label">Название</label>
  </FloatLabel>
  <Button class="mt-3" label="Создать" :disabled="!name" @click="submit" fluid />
</template>
