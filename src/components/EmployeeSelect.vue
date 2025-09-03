<script setup lang="ts">
const props = withDefaults(defineProps<{ id: Employee['id'] | null; disabled?: boolean }>(), {
  disabled: false,
})
const emit = defineEmits(['update:id'])

const organizationStore = useOrganizationStore()
const { stocks } = storeToRefs(organizationStore)

const selectedEmployee = computed(() =>
  props.id !== null ? Employees.findOne({ id: props.id }, { reactive: false }) : undefined,
)
const employees = ref<Employee[]>([])

const employeeOptions = computed(() =>
  stocks.value.map((stock) => ({
    ...stock,
    employees: employees.value.filter((employee) => employee.stock_id === stock.id),
  })),
)

watchEffect((onCleanup) => {
  const employeesCursor = Employees.find()
  employees.value = (employeesCursor.fetch() as Employee[] | undefined) ?? []

  onCleanup(() => {
    employeesCursor.cleanup()
  })
})
</script>

<template>
  <FloatLabel variant="on">
    <Select
      :model-value="selectedEmployee"
      :options="employeeOptions"
      optionGroupLabel="address"
      optionGroupChildren="employees"
      labelId="on_employee_select"
      :disabled="props.disabled"
      filter
      filterPlaceholder="Найти"
      emptyFilterMessage="Сотрудник не найден"
      @update:model-value="(value) => emit('update:id', value.id)"
      class="w-full"
    >
      <template #value="{ value }">
        <div v-if="value" class="flex items-center gap-2">
          <div>
            <EmployeeAvatar :id="value.id" :size="16" />
          </div>
          <div>
            <span>{{ value.first_name }} {{ value.last_name }}</span>
          </div>
        </div>
      </template>
      <template #option="{ option }">
        <div class="flex items-center gap-2">
          <div>
            <EmployeeAvatar :id="option.id" :size="16" />
          </div>
          <div>
            <span>{{ option.first_name }} {{ option.last_name }}</span>
          </div>
        </div>
      </template>
    </Select>
    <label for="on_employee_select">Сотрудник</label>
  </FloatLabel>
</template>
