<script setup lang="ts">
import ProductPackageCreate from './ProductPackageCreate.vue'

// import { Select, InputNumber } from 'primevue'

const injected = inject<{
  productItem: Ref<ProductItem | ProductItemInsert>
  productPackages: Ref<(ProductPackage | ProductPackageInsert)[]>
  productItemMeasureName: ComputedRef<ProductMeasure['name']>
  mode: 'create' | 'edit'
  updateProductMeasureId: (id: ProductMeasure['id']) => void
  updateProductPackageConversionFactor: (
    index: number,
    value: ProductPackage['conversion_factor'],
  ) => void
  createProductPackage: (name: string) => boolean
  removeProductPackage: (index: number) => void
}>('productProfile')
if (!injected) {
  throw new Error('productProfile not provided')
}
const {
  productItem,
  productPackages,
  productItemMeasureName,
  mode,
  updateProductMeasureId,
  updateProductPackageConversionFactor,
  createProductPackage,
  removeProductPackage,
} = injected

const dialog = useDialog()

function openCreatePackageDialog() {
  const dialogRef = dialog.open(
    h(ProductPackageCreate, {
      onSubmit: (name: string) => {
        if (createProductPackage(name) === true) {
          dialogRef.close()
        }
      },
    }),
    {
      props: {
        modal: true,
        header: 'Новая упаковка',
        style: { width: '300px' },
        draggable: false,
      },
    },
  )
}
</script>

<template>
  <div class="flex flex-col">
    <Fieldset
      v-for="(pkg, index) in productPackages"
      :legend="pkg.name === '' ? 'По умолчанию' : pkg.name"
      class="w-full"
    >
      <div class="flex gap-3 justify-between">
        <div class="flex gap-3">
          <template v-if="mode === 'create' && index === 0">
            <FloatLabel variant="on">
              <InputNumber
                :model-value="pkg.conversion_factor"
                :min="1"
                :disabled="true"
                input-class="w-20"
              ></InputNumber>
              <label for="on_label">Коэфф.</label>
            </FloatLabel>
            <MeasureSelect
              :id="productItem.product_measure_id"
              class="w-28"
              @update:id="updateProductMeasureId"
            />
          </template>
          <template v-else>
            <InputGroup>
              <FloatLabel variant="on">
                <InputNumber
                  :model-value="pkg.conversion_factor"
                  :min="1"
                  mode="decimal"
                  :minFractionDigits="2"
                  :useGrouping="false"
                  :allowEmpty="false"
                  :disabled="index === 0 || 'id' in pkg === true"
                  input-class="!w-20"
                  @update:model-value="updateProductPackageConversionFactor(index, $event)"
                />
                <label for="on_label">Коэфф.</label>
              </FloatLabel>
              <InputGroupAddon>{{ productItemMeasureName }}</InputGroupAddon>
            </InputGroup>
          </template>
        </div>
        <div class="flex gap-3">
          <FloatLabel variant="on">
            <InputNumber
              id="on_label"
              v-model="pkg.retail_price"
              :step="100"
              :min="0"
              :allowEmpty="false"
              mode="currency"
              currency="RUB"
              input-class="w-40"
            />
            <label for="on_label">Розничная цена</label>
          </FloatLabel>
          <Button
            v-if="index > 0"
            severity="danger"
            variant="outlined"
            icon="pi pi-trash"
            rounded
            @click="removeProductPackage(index)"
          />
        </div>
      </div>
    </Fieldset>
    <Button
      class="mt-4"
      label="Создать упаковку"
      variant="outlined"
      icon="pi pi-plus"
      @click="openCreatePackageDialog"
      fluid
    />
  </div>
</template>
