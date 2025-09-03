<script lang="ts" setup>
const props = defineProps<{ productItemId: ProductItem['id']; stockId: Stock['id'] }>()
const emit = defineEmits(['close', 'showSelected'])

const { toCurrencyPrice } = useTools()

const productItem = ref<ProductItem | null>(null)
const productShipments = ref<ProductShipment[]>([])
const productBrand = ref<ProductBrand | null>(null)
const productPackageRetailPrice = ref<ProductPackage['retail_price']>(0)

watchEffect((onCleanup) => {
  productItem.value =
    (ProductItems.findOne({ id: props.productItemId }) as ProductItem | undefined) ?? null

  if (productItem.value !== null) {
    const productShipmentsCursor = ProductShipments.find({
      product_item_id: props.productItemId,
      stock_id: props.stockId,
    })
    productShipments.value = (productShipmentsCursor.fetch() as ProductShipment[]) ?? []

    productPackageRetailPrice.value =
      (
        ProductPackages.findOne({
          product_item_id: props.productItemId,
          name: '',
        }) as ProductPackage | undefined
      )?.retail_price ?? 0

    if (productItem.value !== null) {
      productBrand.value =
        (ProductBrands.findOne({
          id: productItem.value.product_brand_id,
        }) as ProductBrand | undefined) ?? null
    }

    onCleanup(() => {
      productShipmentsCursor.cleanup()
    })
  }
})

const maxShipmentPrice = computed(() =>
  productShipments.value.reduce((max, shipment) => {
    return shipment.price > max ? shipment.price : max
  }, 0),
)
</script>

<template>
  <div>
    <div
      class="flex justify-between items-center h-[20px] text-[11px] border-t border-slate-300 cursor-pointer select-none"
    >
      <div
        class="bg-slate-150 hover:bg-slate-50 text-slate-600 hover:text-slate-900 grid h-full w-full items-center"
        @click="emit('showSelected')"
      >
        <span class="truncate px-2" style="width: -webkit-fill-available">
          {{ productBrand?.name }} {{ productItem?.name }}
        </span>
      </div>
      <div
        class="!w-[20px] h-[20px] flex items-center justify-center bg-slate-200 border-l border-t border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
        @click="emit('close')"
      >
        <i class="pi pi-times !text-[11px]"></i>
      </div>
    </div>
    <div class="h-[65px] bg-slate-200 py-4 px-6 border-t border-slate-300">
      <PropertyList
        :options="[
          { name: 'Приход', value: toCurrencyPrice(maxShipmentPrice) },
          { name: 'Продажа', value: toCurrencyPrice(productPackageRetailPrice) },
        ]"
      />
    </div>
  </div>
</template>
