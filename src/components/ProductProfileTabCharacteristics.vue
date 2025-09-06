<script setup lang="ts">
import { Select, InputNumber, InputText } from 'primevue'

const injected = inject<{
  productItem: Ref<ProductItem>
  updateProductTypeId: (id: ProductType['id']) => void
  updateProductProperty: (key: string, value: any) => void
}>('productProfile')
if (!injected) {
  throw new Error('productProfile not provided')
}
const { productItem, updateProductTypeId, updateProductProperty } = injected
const characteristicsScheme = ref<CharacteristicField[]>([])

const availableComponents = { Select, InputNumber, InputText } as {
  [key: string]: Component
}

watchEffect(() => {
  const productType = ProductTypes.findOne(
    { id: productItem.value.product_type_id },
    { reactive: false },
  ) as ProductType
  characteristicsScheme.value = productType.characteristics_scheme
})
</script>

<template>
  <div class="flex flex-col gap-5 items-center">
    <Fieldset legend="Свойства" class="w-full">
      <div class="p-4">
        <ProductTypeSelect :id="productItem.product_type_id" @update:id="updateProductTypeId" />
        <div v-if="characteristicsScheme !== null" class="grid grid-cols-3 gap-4 mt-4">
          <div v-for="field in characteristicsScheme" :key="field.key">
            <FloatLabel variant="on" class="w-full">
              <component
                :is="availableComponents[field.component]"
                :model-value="productItem.characteristics[field.key]"
                v-bind="field.props"
                :id="`on_${field.key}`"
                class="w-full"
                @update:model-value="(value: any) => updateProductProperty(field.key, value)"
              />
              <label for="`on_${key}`">{{ field.label }}</label>
            </FloatLabel>
          </div>
        </div>
      </div>
    </Fieldset>
  </div>
</template>
