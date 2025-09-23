<script lang="ts" setup>
const props = defineProps<{ class: string }>()
// const { supabase } = useSupabase()

const organizationStore = useOrganizationStore()
const { stocks } = storeToRefs(organizationStore)

const { hasCurrentUserPermission } = useClientStore()

const employeeDatas = ref<EmployeeData[]>([])

const isDialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('edit')
const selectedEmployeeId = ref<Employee['id'] | undefined>()

const employeeOptions = computed(() =>
  stocks.value.map((stock) => ({
    ...stock,
    employees: employeeDatas.value.filter((employee) => employee.stock_id === stock.id),
  })),
)

watchEffect((onCleanup) => {
  const employeeDatasCursor = EmployeeDatas.find()
  employeeDatas.value = employeeDatasCursor.fetch() ?? []

  onCleanup(() => {
    employeeDatasCursor.cleanup()
  })
})

function openEmployeeProfile(employeeId: Employee['id']) {
  selectedEmployeeId.value = employeeId
  dialogMode.value = 'edit'
  isDialogVisible.value = true
}

function openCreateEmployeeDialog() {
  selectedEmployeeId.value = undefined
  dialogMode.value = 'create'
  isDialogVisible.value = true
}
</script>

<template>
  <div>
    <EmployeeProfileDialog
      v-model:visible="isDialogVisible"
      :mode="dialogMode"
      :employeeId="selectedEmployeeId"
    />
    <div class="pl-6 pr-3 h-[64px] flex justify-between items-center">
      <h2>Сотрудники</h2>
      <div class="flex gap-1">
        <!-- <Button
          icon="pi pi-shield"
          severity="secondary"
          variant="text"
          size="small"
          v-tooltip.bottom="{ value: 'Роли' }"
          @click=""
          rounded
        /> -->
        <Button
          v-if="hasCurrentUserPermission('employee.create')"
          icon="pi pi-user-plus"
          severity="secondary"
          variant="text"
          size="small"
          v-tooltip.bottom="{ value: 'Создать' }"
          rounded
          @click="openCreateEmployeeDialog"
        />
      </div>
    </div>
    <div class="px-6 pb-3" :class="props.class">
      <template v-for="(option, index) in employeeOptions">
        <template v-if="option.employees.length > 0">
          <div :class="{ 'mt-3': index !== 0 }">
            <span class="font-semibold text-muted-color">
              {{ option.address }}
            </span>
          </div>
          <div class="flex flex-col gap-3 mt-3">
            <div
              v-for="employee in option.employees"
              :key="employee.id"
              class="flex gap-3 items-center cursor-pointer border rounded-lg p-3 border-surface hover:border-surface-500 bg-surface-50 dark:bg-surface-900"
              @click="openEmployeeProfile(employee.id)"
            >
              <div>
                <EmployeeAvatar :id="employee.id" :size="24" />
              </div>
              <div>
                <span>{{ employee.first_name }} {{ employee.last_name }}</span>
                <br />
                <span class="flex gap-1 items-center text-muted-color text-xs"> В сети </span>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>
