<script setup lang="ts">
const injected = inject<{
  productItem: Ref<ProductItem>
  mode: string
  updateProductName: (value: string | undefined) => void
  updateProductBrandId: (product_brand_id: ProductBrand['id']) => void
}>('productProfile')
if (!injected) {
  throw new Error('ProductProfile not provided')
}
const { productItem, mode, updateProductName, updateProductBrandId } = injected
</script>

<template>
  <div class="flex gap-4 w-full mr-4 flex-col md:flex-row">
    <div v-if="mode === 'edit'">
      <FloatLabel variant="on">
        <InputNumber
          id="on_label"
          :default-value="productItem.id"
          :useGrouping="false"
          input-class="w-28 text-center !rounded-full"
          disabled
        />
        <label for="on_label">Артикул</label>
      </FloatLabel>
    </div>
    <div class="w-full">
      <FloatLabel variant="on">
        <InputText
          :model-value="productItem.name"
          id="on_label"
          class="w-full"
          @update:model-value="updateProductName"
        />
        <label for="on_label">Наименование</label>
      </FloatLabel>
    </div>
    <div>
      <BrandSelect
        :id="productItem.product_brand_id"
        @update:id="updateProductBrandId"
        class="w-64"
      />
    </div>
  </div>
</template>
