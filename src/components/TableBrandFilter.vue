<script lang="ts" setup>
import { IFilterParams, IDoesFilterPassParams } from 'ag-grid-community'

const props = defineProps<{ params: IFilterParams }>()

const selectedProductBrandName = ref<ProductBrand['name'] | null>(null)
const productBrandOptions = ref<string[]>([])
// const productBrandOptions = computed(() => {
//   const values = new Set<string>()

//   props.params.api.forEachNode((node) => {
//     props.params.api.getCellValue
//     const value = props.params.api.getCellValue({ rowNode: node, colKey: 'product_brand_id' })
//     if (value != null) {
//       values.add(value)
//     }
//   })

//   return Array.from(values).sort()
// })

function updateProductBrandOptions() {
  const values = new Set<string>()
  props.params.api.forEachNode((node) => {
    const value = props.params.api.getCellValue({ rowNode: node, colKey: 'product_brand_name' })
    if (value != null) {
      values.add(value)
    }
  })
  productBrandOptions.value = Array.from(values).sort()
}

function updateFilter() {
  if (selectedProductBrandName.value === '') {
    selectedProductBrandName.value = null
  }
  props.params.filterChangedCallback()
}

function doesFilterPass({ node }: IDoesFilterPassParams<ProductItem>) {
  return (
    props.params.api.getCellValue({ rowNode: node, colKey: 'product_brand_name' }) ===
    selectedProductBrandName.value
  )
}

function isFilterActive() {
  return selectedProductBrandName.value !== '' && selectedProductBrandName.value !== null
}

function getModel() {}

function setModel() {}

defineExpose({
  updateFilter,
  doesFilterPass,
  isFilterActive,
  getModel,
  setModel,
})

onMounted(() => {
  props.params.api.addEventListener('rowDataUpdated', updateProductBrandOptions)
  updateProductBrandOptions()
})

onBeforeUnmount(() => {
  props.params.api.removeEventListener('rowDataUpdated', updateProductBrandOptions)
})
</script>

<template>
  <div class="m-4">
    <Select
      v-model="selectedProductBrandName"
      :options="productBrandOptions"
      placeholder="Выбрать бренд"
      class="w-full"
      @update:model-value="updateFilter"
      showClear
    />
  </div>
</template>
