<script lang="ts" setup>
const props = defineProps<{
  stockId: Stock['id']
  productItemId: ProductItem['id']
  retailPrice: ProductItem['retail_price']
}>()

const { toCurrencyPrice } = useTools()
const { getStockById } = useOrganizationStore()

const productItem = computed(
  () => ProductItems.findOne({ id: props.productItemId }, { reactive: false }) as ProductItem,
)
const stock = computed(() => getStockById(props.stockId))

function getProductBrandById(id: ProductBrand['id']) {
  return ProductBrands.findOne({ id }, { reactive: false }) as ProductBrand
}

function getProductMeasureById(id: ProductMeasure['id']) {
  return ProductMeasures.findOne({ id }, { reactive: false }) as ProductMeasure
}

function getCountryById(id: Country['id']) {
  return Countries.findOne({ id }, { reactive: false }) as Country
}

function getOrganizationById(id: Organization['id']) {
  return Organizations.findOne({ id }, { reactive: false }) as Organization
}

function getCityById(id: City['id']) {
  return Cities.findOne({ id }, { reactive: false }) as City
}
</script>

<template>
  <div class="w-[85mm] h-[40mm] border border-slate-400 px-2 pt-2 flex flex-col text-black">
    <div class="leading-5">
      <span class="font-bold">{{ productItem.name }}</span>
      <br />
      <span>{{ getProductBrandById(productItem.product_brand_id)?.name }}</span>
      <span v-if="productItem.country_id !== null">
        ({{ getCountryById(productItem.country_id).name }})
      </span>
    </div>
    <div class="text-6xl font-extrabold text-center m-auto">
      {{ toCurrencyPrice(props.retailPrice) }}
    </div>
    <div>
      <div class="text-xs flex justify-between">
        <span>Арт.: {{ productItem.id }}</span>
        <span>Цена за: 1 {{ getProductMeasureById(productItem.product_measure_id)?.name }}</span>
      </div>
      <div v-if="stock !== null" class="text-xs flex justify-between border-t border-black">
        <span>{{ getOrganizationById(stock.organization_id)?.name }}</span>
        <span class="">{{ getCityById(stock.city_id)?.name }}, {{ stock.address }}</span>
      </div>
    </div>
  </div>
</template>
