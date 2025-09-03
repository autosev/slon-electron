<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { IStatusPanelParams } from 'ag-grid-community'

const props = defineProps<{ api: any }>()

const totalPrice = ref(0)

const { toCurrencyPrice } = useTools()

function updateSum() {
  let result = 0
  props.api.forEachNode((node: any) => {
    const value = props.api.getValue('priceSum', node)
    result += Number(value)
  })
  totalPrice.value = result
}

onMounted(() => {
  props.api.addEventListener('modelUpdated', updateSum)
  updateSum()
})
</script>

<template>
  <div class="px-3 text-sm font-semibold">Итого: {{ toCurrencyPrice(totalPrice) }}</div>
</template>
