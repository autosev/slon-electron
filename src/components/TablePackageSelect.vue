<script lang="ts" setup>
import { ICellEditorParams } from 'ag-grid-community'
import { Decimal } from 'decimal.js'

const props = defineProps<{
  params: ICellEditorParams<InvoiceArrivalItem | InvoiceExpenditureItem, ProductPackage['id']>
}>()

const value = ref<number | null | undefined>(props.params.value)
const options = computed(() => {
  if ('product_item_id' in props.params.data) {
    const { product_item_id } = props.params.data
    const productItem = ProductItems.findOne({ id: product_item_id }, { reactive: false }) as
      | ProductItem
      | undefined

    if (productItem !== undefined) {
      const productMeasure = ProductMeasures.findOne(
        { id: productItem.product_measure_id },
        { reactive: false },
      ) as ProductMeasure | undefined

      if (productMeasure !== undefined) {
        const packages =
          (ProductPackages.find({ product_item_id }, { reactive: false }).fetch() as
            | ProductPackage[]
            | undefined) ?? []
        return packages.map((pkg) => ({
          id: pkg.id,
          name: pkg.name === '' ? productMeasure.name : pkg.name,
        }))
      }
    }
  }

  return []
})

function getValue() {
  return value.value
}

function isPopup() {
  return false
}

function onChange() {
  props.params.data.quantity = 0
}

defineExpose({
  getValue,
  isPopup,
})
</script>

<template>
  <Select
    v-model="value"
    :options="options"
    option-label="name"
    option-value="id"
    size="small"
    class="w-full h-[30px]"
    :pt="{ label: '!py-0' }"
    @change="onChange"
    autofocus
  />
</template>
