<script setup lang="ts">
const props = defineProps<{ id: Country['id'] | null }>()
const emit = defineEmits(['update:id'])

const countriesOptions = ref<{ id: Country['id']; name: Country['name'] }[]>([])
const { countryCodeToEmoji } = useTools()

watchEffect((onCleanup) => {
  const countriesCursor = Countries.find({}, { sort: { name: 1 } })
  const countries = (countriesCursor.fetch() as Country[] | undefined) ?? []
  countriesOptions.value = countries.map((country) => ({
    ...country,
    name: countryCodeToEmoji(country.code) + ' ' + country.name,
  }))

  onCleanup(() => {
    countriesCursor.cleanup()
  })
})

// const getFlagUrl = (code: string) => {
//   // Проверяем наличие кода на всякий случай
//   if (!code) return ''
//   // Используем путь, куда вы скопировали флаги
//   return `/flags/${code.toUpperCase()}.svg`
// }
</script>

<template>
  <FloatLabel variant="on">
    <Select
      :model-value="props.id"
      :options="countriesOptions"
      class="w-full"
      optionLabel="name"
      labelId="on_product_brand"
      filter
      @update:model-value="(value) => emit('update:id', value)"
    ></Select>
    <label for="on_product_brand">Страна-производитель</label>
  </FloatLabel>
</template>
