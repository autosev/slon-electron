<script lang="ts" setup>
const props = defineProps<{ note: string; disabled: boolean }>()
const emit = defineEmits(['update:note'])
const noteTemplates = [
  {
    label: 'Формы оплаты',
    items: ['Оплата наличными', 'Безналичный расчет', 'Бартер'],
  },
  {
    label: 'Другое',
    items: ['Заводской брак', 'Сторно документа '],
  },
]
</script>

<template>
  <FloatLabel variant="on">
    <Select
      v-model="props.note"
      editable
      :options="noteTemplates"
      :disabled="props.disabled"
      option-group-label="label"
      option-group-children="items"
      labelId="on_invoice_note"
      @change="emit('update:note', $event.value)"
      class="w-full"
    />
    <label for="on_invoice_note">Комментарий</label>
  </FloatLabel>
</template>
