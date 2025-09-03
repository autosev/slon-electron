<script lang="ts" setup>
import { ICellEditorParams } from 'ag-grid-community'

const props = defineProps<{ params: ICellEditorParams }>()

const value = ref<number>(0)

function getValue() {
  return value.value
}

function isPopup() {
  return false
}

defineExpose({
  getValue,
  isPopup,
})
</script>

<template>
  <InputNumber v-model="value" inputId="integeronly" input-class="!py-0 !w-fit" autofocus />
</template>
