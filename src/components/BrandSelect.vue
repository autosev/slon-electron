<script setup lang="ts">
import BrandCreate from './BrandCreate.vue'

const props = defineProps<{ id: ProductBrand['id'] }>()
const emit = defineEmits(['update:id'])

const dialog = useDialog()

const productBrandOptions = ref<ProductBrand[]>()

watchEffect((onCleanup) => {
  const productBrandsCursor = ProductBrands.find({}, { sort: { name: 1 } })
  productBrandOptions.value = productBrandsCursor.fetch() as ProductBrand[]

  onCleanup(() => {
    productBrandsCursor.cleanup()
  })
})

function openCreateDialog() {
  const dialogRef = dialog.open(
    h(BrandCreate, {
      onSubmited: (id: ProductBrand['id']) => {
        dialogRef.close()
        emit('update:id', id)
      },
    }),
    {
      props: {
        modal: true,
        header: 'Новый бренд',
        style: { width: '300px' },
        draggable: false,
      },
    },
  )
}
</script>

<template>
  <FloatLabel variant="on">
    <Select
      :model-value="props.id"
      :options="productBrandOptions"
      class="w-full"
      optionValue="id"
      optionLabel="name"
      labelId="on_product_brand"
      filter
      @update:model-value="(value) => emit('update:id', value)"
    >
      <template #footer>
        <div class="p-3">
          <Button
            label="Добавить новый"
            severity="secondary"
            size="small"
            icon="pi pi-plus"
            @click="openCreateDialog"
            fluid
            text
          />
        </div>
      </template>
    </Select>
    <label for="on_product_brand">Бренд</label>
  </FloatLabel>
</template>
