<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    id: number | null
    disabled?: boolean
    label?: string
    optionDisabled?: (data: Stock) => boolean
  }>(),
  {
    disabled: false,
    label: 'Склад',
  },
)
const emit = defineEmits(['update:id'])

const { currentEmployee } = storeToRefs(useClientStore())

const organizationStore = useOrganizationStore()
const { organizations } = storeToRefs(organizationStore)
</script>

<template>
  <FloatLabel class="w-full md:w-auto" variant="on">
    <Select
      :model-value="props.id"
      :options="organizations"
      :disabled="props.disabled"
      optionValue="id"
      optionLabel="address"
      optionGroupLabel="name"
      optionGroupChildren="stocks"
      :option-disabled="props.optionDisabled"
      labelId="on_stock"
      overlayClass="w-auto"
      scrollHeight="30rem"
      @update:model-value="(value: Stock['id']) => emit('update:id', value)"
      class="w-full"
    >
      <template #option="slotProps">
        <div class="flex items-center justify-between w-full gap-x-8">
          <span>{{ slotProps.option.address }}</span>
          <Tag
            v-if="currentEmployee !== null && slotProps.option.id === currentEmployee.stock_id"
            severity="success"
            value="Мой"
          />
          <Tag v-else-if="slotProps.option.note === 'Основной'" severity="info" value="Основной" />
          <Tag v-else-if="slotProps.option.note" :value="slotProps.option.note" />
        </div>
      </template>
    </Select>
    <label for="on_stock">{{ props.label }}</label>
  </FloatLabel>
</template>
