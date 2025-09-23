<script setup lang="ts">
const props = defineProps<{ roles: EmployeeRole['id'][]; disabled: boolean }>()
const emit = defineEmits(['update:roles'])

const employeeRoleOptions = ref<EmployeeRole[]>([])

watchEffect((onCleanup) => {
  const employeeRolesCursor = EmployeeRoles.find()
  employeeRoleOptions.value = employeeRolesCursor.fetch() ?? []

  onCleanup(() => {
    employeeRolesCursor.cleanup()
  })
})
</script>

<template>
  <FloatLabel variant="on">
    <MultiSelect
      :model-value="props.roles"
      :options="employeeRoleOptions"
      :disabled="props.disabled"
      class="w-full"
      optionValue="id"
      option-label="name"
      labelId="on_product_brand"
      display="chip"
      :show-toggle-all="false"
      @update:model-value="emit('update:roles', $event)"
      fluid
    >
      <template #option="{ option }">
        <div>
          <div>
            {{ option.name }}
          </div>
          <div class="text-xs text-muted-color">
            {{ option.description }}
          </div>
        </div>
      </template>
    </MultiSelect>
    <label for="on_product_brand">Роли</label>
  </FloatLabel>
</template>
