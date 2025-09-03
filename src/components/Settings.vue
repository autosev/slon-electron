<script setup lang="ts">
import AccountingPeriodEditor from './AccountingPeriodEditor.vue'

const { getUserSessionPasswordStatus, setUserPassword, removeUserPassword } = useAuth()

const { currentUser } = storeToRefs(useClientStore())

const isUserSessionHasPassword = ref(
  currentUser.value !== null ? getUserSessionPasswordStatus(currentUser.value.id) : false,
)
const newPassword = ref('')
const newPasswordRepeat = ref('')
const oldPassword = ref('')
const isChangePasswordDialogVisible = ref(false)
const isChangePasswordError = ref(false)
const isCreatePasswordDialogVisible = ref(false)
const isCreatePasswordError = ref(false)

const dialog = useDialog()

function changePassword() {
  const isSuccess = setUserPassword(newPassword.value, oldPassword.value)
  if (isSuccess === true) {
    isChangePasswordError.value = false
    isUserSessionHasPassword.value = true
    isChangePasswordDialogVisible.value = false
  } else {
    isChangePasswordError.value = true
  }
}

function createPassword() {
  const isSuccess = setUserPassword(newPassword.value)
  if (isSuccess === true) {
    isCreatePasswordError.value = false
    isUserSessionHasPassword.value = true
    isCreatePasswordDialogVisible.value = false
  } else {
    isCreatePasswordError.value = true
  }
}

function afterDialogHide() {
  isChangePasswordError.value = false
  isCreatePasswordError.value = false
  oldPassword.value = ''
  newPassword.value = ''
  newPasswordRepeat.value = ''
}

function removePassword() {
  const isSuccess = removeUserPassword()
  if (isSuccess === true) {
    isUserSessionHasPassword.value = false
  }
}

function openAccountingPeriodEditorDialog() {
  dialog.open(
    h(AccountingPeriodEditor, {
      // onSubmited: (id: ProductBrand['id']) => {
      //   dialogRef.close()
      //   emit('update:id', id)
      // },
    }),
    {
      props: {
        modal: true,
        header: 'Закрытие периода',
        style: { width: '500px' },
        draggable: false,
      },
    },
  )
}
</script>

<template>
  <div>
    <div class="mx-5 flex flex-col gap-5">
      <div>
        <h3 class="font-semibold">Администрирование</h3>
        <div class="flex flex-col gap-3 mt-3">
          <Button
            label="Закрытие периода"
            severity="contrast"
            variant="outlined"
            icon="pi pi-calendar-clock"
            fluid
            @click="openAccountingPeriodEditorDialog"
          />
        </div>
      </div>
      <div>
        <h3 class="font-semibold">Безопасность</h3>
        <div v-if="isUserSessionHasPassword === false" class="mt-3 flex flex-col gap-3">
          <Button
            label="Установить пароль"
            severity="contrast"
            variant="outlined"
            icon="pi pi-key"
            @click="isCreatePasswordDialogVisible = true"
            fluid
          />
        </div>
        <div v-else class="mt-4 flex flex-col gap-3">
          <Button
            label="Изменить пароль"
            severity="contrast"
            variant="outlined"
            icon="pi pi-pencil"
            @click="isChangePasswordDialogVisible = true"
            fluid
          />
          <Button
            label="Удалить пароль"
            severity="contrast"
            variant="outlined"
            icon="pi pi-eraser"
            @click="removePassword"
            fluid
          />
        </div>
      </div>
      <div>
        <h3 class="font-semibold">Приложение</h3>
        <div class="mt-3 flex flex-col gap-3">
          <Button
            label="Файл диагностики"
            severity="contrast"
            variant="outlined"
            icon="pi pi-download"
            fluid
          />
          <!-- <Button
            label="Очистить кеш"
            severity="danger"
            variant="outlined"
            icon="pi pi-key"
            fluid
          /> -->
          <Button
            label="Сброс данных"
            severity="danger"
            variant="outlined"
            icon="pi pi-refresh"
            fluid
          />
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="isCreatePasswordDialogVisible"
      header="Установить пароль"
      :style="{ width: '20rem' }"
      :draggable="false"
      @after-hide="afterDialogHide"
      modal
    >
      <Message v-if="isCreatePasswordError" size="small" severity="error" variant="simple">
        Произошла ошибка при установке пароля.
      </Message>
      <div class="flex flex-col gap-3 mb-6">
        <Password
          v-model="newPassword"
          placeholder="Новый пароль"
          :feedback="false"
          input-class="w-full"
          toggleMask
        />
        <Password
          v-model="newPasswordRepeat"
          placeholder="Повторить пароль"
          :feedback="false"
          input-class="w-full"
          toggleMask
        />
      </div>
      <div class="flex justify-end gap-3">
        <Button
          type="button"
          label="Закрыть"
          severity="secondary"
          @click="isCreatePasswordDialogVisible = false"
        ></Button>
        <Button
          type="button"
          label="Подтвердить"
          @click="createPassword"
          :disabled="
            newPassword === '' || newPasswordRepeat === '' || newPassword !== newPasswordRepeat
          "
        ></Button>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="isChangePasswordDialogVisible"
      modal
      header="Изменить пароль"
      :style="{ width: '20rem' }"
      :draggable="false"
      @after-hide="afterDialogHide"
    >
      <Message
        v-if="isChangePasswordError"
        size="small"
        severity="error"
        variant="simple"
        class="mb-4"
      >
        Произошла ошибка при изменении пароля.
      </Message>
      <div class="flex flex-col gap-3 mb-6">
        <Password
          v-model="oldPassword"
          placeholder="Старый пароль"
          :feedback="false"
          input-class="w-full"
          toggleMask
        />
        <Password
          v-model="newPassword"
          placeholder="Новый пароль"
          :feedback="false"
          input-class="w-full"
          toggleMask
        />
        <Password
          v-model="newPasswordRepeat"
          placeholder="Повторить пароль"
          :feedback="false"
          input-class="w-full"
          toggleMask
        />
      </div>
      <div class="flex justify-end gap-3">
        <Button
          type="button"
          label="Закрыть"
          severity="secondary"
          @click="isChangePasswordDialogVisible = false"
        ></Button>
        <Button
          type="button"
          label="Подтвердить"
          @click="changePassword"
          :disabled="
            oldPassword === '' ||
            newPassword === '' ||
            newPasswordRepeat === '' ||
            newPassword !== newPasswordRepeat
          "
        ></Button>
      </div>
    </Dialog>
  </div>
</template>
