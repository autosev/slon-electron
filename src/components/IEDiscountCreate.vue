<script setup lang="ts">
import { Decimal } from 'decimal.js'
import { InputNumberInputEvent } from 'primevue'

const props = defineProps<{
  productItemId: ProductItem['id']
  productPackageId: ProductPackage['id']
  price: number
}>()

const emit = defineEmits<{ (e: 'submit', price: number): void }>()

type DiscountType = 'subtract' | 'percent'

const retailPrice = ref<number>(0)

const discount = ref<number>(0)
const discountType = ref<DiscountType>('subtract')
const discountOptions = [
  { label: '₽', value: 'subtract' },
  { label: '%', value: 'percent' },
]

const newPrice = computed(() => {
  if (discount.value >= retailPrice.value) {
    return 0
  }

  if (discountType.value === 'subtract') {
    return new Decimal(retailPrice.value).minus(discount.value).toNumber()
  } else if (discountType.value === 'percent') {
    return new Decimal(retailPrice.value)
      .minus(new Decimal(retailPrice.value).times(discount.value).dividedBy(100))
      .toNumber()
  } else {
    return retailPrice.value
  }
})

const maxDiscountInput = computed(() => {
  if (discountType.value === 'subtract') {
    return retailPrice.value
  } else if (discountType.value === 'percent') {
    return 100
  } else {
    return 0
  }
})

function onDiscountTypeUpdate(value: DiscountType) {
  if (value === 'subtract') {
    discount.value = new Decimal(retailPrice.value).times(discount.value).dividedBy(100).toNumber()
  } else if (value === 'percent') {
    discount.value = new Decimal(discount.value).dividedBy(retailPrice.value).times(100).toNumber()
  }
}

function onDiscountInput(event: InputNumberInputEvent) {
  discount.value = Number(event.value) ?? 0
}

onMounted(() => {
  const pkg = ProductPackages.findOne({ id: props.productPackageId }) as ProductPackage | undefined
  retailPrice.value = pkg?.retail_price ?? 0

  if (retailPrice.value >= discount.value && discountType.value === 'subtract') {
    discount.value = new Decimal(retailPrice.value).minus(props.price).toNumber()
  }
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex gap-3 mt-2">
      <FloatLabel variant="on">
        <InputNumber
          :model-value="discount"
          type="number"
          :allow-empty="false"
          :min="0"
          :max="maxDiscountInput"
          fluid
          autofocus
          @input="onDiscountInput"
          @keyup.enter="emit('submit', newPrice)"
        />
        <label for="on_label">Значение скидки</label>
      </FloatLabel>
      <Select
        v-model="discountType"
        :options="discountOptions"
        optionValue="value"
        optionLabel="label"
        labelId="on_product_measure"
        class="w-36"
        @update:model-value="onDiscountTypeUpdate"
      />
    </div>
    <FloatLabel variant="on">
      <InputNumber
        :model-value="newPrice"
        id="on_label"
        :step="100"
        :min="0"
        :allowEmpty="false"
        mode="currency"
        currency="RUB"
        input-class="text-center"
        fluid
        disabled
      />
      <label for="on_label">Итоговая цена</label>
    </FloatLabel>
  </div>
  <Button class="mt-5" label="Применить" @click="emit('submit', newPrice)" fluid />
</template>
