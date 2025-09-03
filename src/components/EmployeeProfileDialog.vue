<script setup lang="ts">
import equal from 'fast-deep-equal'

const props = withDefaults(
  defineProps<{
    visible: boolean
    employeeId?: Employee['id']
    mode?: 'edit' | 'create'
  }>(),
  { mode: 'edit' },
)
const emit = defineEmits(['update:visible', 'updated', 'created'])

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const clientStore = useClientStore()
const { hasCurrentUserPermission } = clientStore
const { currentEmployee } = storeToRefs(clientStore)

const { supabase } = useSupabase()
const { syncManager } = useSignalDB()
const { phoneStrip } = useTools()
const toast = useToast()

const isEditable = computed(() =>
  props.mode === 'create'
    ? hasCurrentUserPermission('employee.create')
    : hasCurrentUserPermission('employee.update'),
)

const employeeData = ref<EmployeeData | EmployeeDataInsert>(getEmployeeData(props.employeeId))

watch(
  () => props.visible,
  (newValue) => {
    if (newValue === true) {
      employeeData.value = getEmployeeData(props.employeeId)
    }
  },
)

const employeePermissions = computed(() => {
  const rolePermissions =
    EmployeeRolePermissions.find(
      { employee_role_id: { $in: employeeData.value.roles } },
      { reactive: false },
    ).fetch() ?? []
  const rolePermissionIds = rolePermissions.map((rp) => rp.id)

  return (
    EmployeePermissions.find({ id: { $in: rolePermissionIds } }, { reactive: false }).fetch() ?? []
  )
})

function getEmployeeData(id: Employee['id'] | undefined) {
  if (props.employeeId !== undefined) {
    const employeeData = EmployeeDatas.findOne({ id: id }, { reactive: false })

    if (employeeData !== undefined) {
      return structuredClone(employeeData)
    }
  }
  return {
    first_name: '',
    last_name: '',
    stock_id: null,
    phone: '',
    roles: [],
  } as EmployeeDataInsert
}

function updatePhone() {
  employeeData.value.phone = phoneStrip(employeeData.value.phone)
}

const isUpdateDisabled = computed(() => {
  const previousEmployeeData = getEmployeeData(props.employeeId)
  return (
    equal(previousEmployeeData, employeeData.value) === true ||
    employeeData.value.first_name === '' ||
    employeeData.value.last_name === '' ||
    employeeData.value.phone.length !== 11 ||
    employeeData.value.roles.length === 0
  )
})

const isCreateDisabled = computed(() => {
  return (
    employeeData.value.first_name === '' ||
    employeeData.value.last_name === '' ||
    employeeData.value.stock_id === null ||
    employeeData.value.phone.length !== 11 ||
    employeeData.value.roles.length === 0
  )
})

async function createEmployee() {
  if (isCreateDisabled.value === false) {
    try {
      await supabase.functions.invoke('create-employee', {
        body: {
          first_name: employeeData.value.first_name,
          last_name: employeeData.value.last_name,
          phone: employeeData.value.phone,
          stock_id: employeeData.value.stock_id,
          role_ids: employeeData.value.roles,
        },
      })

      emit('update:visible', false)

      toast.add({
        severity: 'success',
        summary: 'Сотрудник создан',
        detail: `Сотрудник ${employeeData.value.first_name} ${employeeData.value.last_name} успешно создан.`,
        life: 3000,
      })

      syncManager.sync('employee_data')
    } catch (e) {
      console.error('Ошибка в функции create_employee_rpc:', e)
      if (e instanceof Error) {
        let detailErrorMessage = e.message
        if (e.message.includes('permission_denied')) {
          detailErrorMessage = 'У вас нет прав для выполнения этой операции.'
        }
        toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: detailErrorMessage,
          life: 5000,
        })
      }
    }
  }
}

async function updateEmployee() {
  if ('id' in employeeData.value && isUpdateDisabled.value === false) {
    try {
      await supabase
        .rpc('update_employee_rpc', {
          p_id: employeeData.value.id,
          p_first_name: employeeData.value.first_name,
          p_last_name: employeeData.value.last_name,
          p_phone: employeeData.value.phone,
          p_stock_id: employeeData.value.stock_id,
          p_role_ids: employeeData.value.roles,
        })
        .throwOnError()

      emit('update:visible', false)

      toast.add({
        severity: 'success',
        summary: 'Информация обновлена',
        detail: `Информация о сотруднике ${employeeData.value.first_name} ${employeeData.value.last_name} успешно обновлена.`,
        life: 3000,
      })

      syncManager.sync('employee_data')
    } catch (e) {
      console.error('Ошибка в функции update_employee_rpc:', e)
      if (e instanceof Error) {
        let detailErrorMessage = e.message
        if (e.message.includes('permission_denied')) {
          detailErrorMessage = 'У вас нет прав для выполнения этой операции.'
        }
        toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: detailErrorMessage,
          life: 5000,
        })
      }
    }
  }
}
</script>

<template>
  <Dialog
    v-model:visible="isVisible"
    class="!bg-slate-100"
    :style="{ width: '600px' }"
    :draggable="false"
    :close-on-escape="false"
    modal
  >
    <template #header>
      <div class="flex gap-4 items-center w-full pr-4">
        <EmployeeAvatar v-if="props.employeeId !== undefined" :id="props.employeeId" :size="32" />
        <FloatLabel variant="on" class="w-full">
          <InputText
            v-model="employeeData.first_name"
            :disabled="!isEditable"
            id="on_employee_first_name"
            class="w-full"
          />
          <label for="on_employee_first_name">Имя</label>
        </FloatLabel>
        <FloatLabel variant="on" class="w-full">
          <InputText
            v-model="employeeData.last_name"
            :disabled="!isEditable"
            id="on_employee_last_name"
            class="w-full"
          />
          <label for="on_employee_last_name">Фамилия</label>
        </FloatLabel>
      </div>
    </template>
    <div class="bg-white rounded-lg px-5 pt-1 pb-5">
      <Fieldset legend="Контакты">
        <div class="flex justify-between px-4 py-2">
          <div class="min-w-32">
            <StockSelect v-model:id="employeeData.stock_id" :disabled="!isEditable" />
          </div>
          <div class="flex gap-3">
            <FloatLabel variant="on" class="w-44">
              <InputMask
                v-model="employeeData.phone"
                :disabled="!isEditable"
                id="on_employee_last_name"
                mask="+7 (999) 999-99-99"
                class="w-full"
                @complete="updatePhone"
              />
              <label for="on_employee_last_name">Телефон</label>
            </FloatLabel>
          </div>
        </div>
      </Fieldset>
      <Fieldset legend="Разрешения">
        <div class="flex flex-col px-5 py-2 gap-4">
          <div>
            <EmployeeRoleMultiSelect v-model:roles="employeeData.roles" :disabled="!isEditable" />
          </div>
          <div v-if="employeeData.roles.length > 0">
            <ul class="list-disc pl-4">
              <li v-for="permission in employeePermissions" :key="permission.id">
                {{ permission.description }}
              </li>
            </ul>
          </div>
        </div>
      </Fieldset>
    </div>
    <template #footer>
      <div class="flex justify-between gap-4">
        <div></div>
        <div>
          <Button
            v-if="props.mode === 'create'"
            label="Создать"
            :disabled="isCreateDisabled"
            @click="createEmployee"
          />
          <template v-else-if="props.mode === 'edit'">
            <Button
              v-if="isEditable === true"
              label="Обновить"
              :disabled="isUpdateDisabled"
              @click="updateEmployee"
            />
            <HintMessage
              v-else-if="currentEmployee?.id === props.employeeId"
              content="Для изменения данных обратитесь к одному из администраторов."
            />
          </template>
        </div>
      </div>
    </template>
  </Dialog>
</template>
