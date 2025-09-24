<script setup lang="ts">
const { getUsers, startSession, getUserSessionPasswordStatus } = useAuth()
const router = useRouter()

const selectedUser = ref<{ id: string; name: string } | null>(null)
const users = ref(getUsers())

const isUserPasswordDialogVisible = ref(false)
const isUserPasswordError = ref(false)
const userPassword = ref('')

function submit() {
  if (selectedUser.value?.id) {
    const isSessionHasPassword = getUserSessionPasswordStatus(selectedUser.value.id)

    if (isSessionHasPassword === true) {
      isUserPasswordDialogVisible.value = true
    } else {
      startSession(selectedUser.value.id)
      router.push({ name: 'workspace' })
    }
  }
}

function userPasswordSubmit() {
  if (selectedUser.value?.id) {
    const isSessionHasPassword = getUserSessionPasswordStatus(selectedUser.value.id)

    if (isSessionHasPassword === true && userPassword.value !== '') {
      const isSuccess = startSession(selectedUser.value.id, userPassword.value)

      if (isSuccess === true) {
        isUserPasswordDialogVisible.value = false
        router.push({ name: 'workspace' })
      } else {
        isUserPasswordError.value = true
      }
    } else {
      startSession(selectedUser.value.id)
      isUserPasswordDialogVisible.value = false
      router.push({ name: 'workspace' })
    }
  }
}

function afterUserPasswordDialogHide() {
  userPassword.value = ''
  isUserPasswordError.value = false
}

onMounted(() => {
  if (users.value.length === 0) {
    router.push({ name: 'user-login' })
  }
})
</script>

<template>
  <div class="flex w-full h-full select-none">
    <div
      class="flex flex-col w-2/6 bg-surface-100 dark:bg-surface-900 justify-center items-center text-center gap-4 border-r border-surface"
    >
      <i class="pi pi-users !text-2xl"></i>
      <div>
        <h1 class="font font-medium">Добрый день</h1>
        <span class="text-slate-600 dark:text-muted-color px-4"
          >Выберите пользователя из списка или добавьте нового</span
        >
        <Message size="small" icon="pi pi-exclamation-triangle" severity="warn" class="mt-4 mx-10">
          Система учёта находится в стадии тестирования. Данные в программе не являются актуальными.
        </Message>
      </div>
    </div>
    <div class="flex w-4/6 justify-center items-center select-none dark:bg-surface-900">
      <div class="flex flex-col gap-4 w-80">
        <div class="flex gap-4">
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-server"></i>
            </InputGroupAddon>
            <FloatLabel variant="on" class="!w-[14rem]">
              <Select
                value="uuid-1"
                optionValue="id"
                optionLabel="name"
                :options="[
                  {
                    id: 'uuid-1',
                    name: 'Рабочий сервер (Coolify)',
                    apiUrl: 'https://my-supabase.example.com',
                    anonKey: 'eyJhbGci...',
                  },
                  {
                    id: 'uuid-2',
                    name: 'Тестовый сервер (новый)',
                    apiUrl: 'http://192.168.1.10:8000',
                    anonKey: 'eyJhbGci...',
                  },
                ]"
                id="server"
              >
                <template #option="{ option }">
                  <div>
                    <div>{{ option.name }}</div>
                    <div class="text-xs">
                      {{ option.apiUrl.replace(/^(https?|ftp):\/\//, '') }}
                    </div>
                  </div>
                </template>
                <template #footer>
                  <div class="p-1">
                    <Button
                      label="Добавить новый"
                      fluid
                      severity="secondary"
                      variant="text"
                      size="small"
                      icon="pi pi-plus"
                      @click="router.push({ name: 'server' })"
                    />
                  </div>
                </template>
              </Select>
              <label for="server">Сервер</label>
            </FloatLabel>
          </InputGroup>
          <div>
            <Button icon="pi pi-ellipsis-v" severity="primary" variant="outlined" />
          </div>
        </div>

        <Fieldset v-if="users.length > 0" legend="Пользователи">
          <div class="flex flex-col gap-5 p-2">
            <div class="flex justify-center">
              <Listbox
                v-model="selectedUser"
                :options="users"
                optionLabel="name"
                class="w-full"
                :filter="users.length > 5"
                filterPlaceholder="Найти себя"
                :pt="{ root: '!rounded-xl', option: '!rounded-lg' }"
              >
                <template #option="{ option }">
                  <EmployeeAvatar :id="option.id" :size="28" class="mr-2" />
                  {{ option.name }}
                </template>
                <template #empty> Нет добавленных пользователей. </template>
              </Listbox>
            </div>
            <div>
              <Button
                type="submit"
                label="Войти"
                icon="pi pi-sign-in"
                :disabled="selectedUser === null"
                @click="submit"
                fluid
                rounded
              />
            </div>
          </div>
        </Fieldset>
        <Button
          type="submit"
          severity="secondary"
          label="Добавить пользователя"
          icon="pi pi-user-plus"
          class="mt-3"
          fluid
          @click="router.push({ name: 'user-login' })"
        />
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="isUserPasswordDialogVisible"
    modal
    header="Вход в аккаунт"
    :draggable="false"
    :style="{ width: '20rem' }"
    @after-hide="afterUserPasswordDialogHide"
  >
    <div class="flex flex-col mb-6">
      <IconField class="w-full">
        <InputIcon>
          <i class="pi pi-key" />
        </InputIcon>
        <Password
          v-model="userPassword"
          @keyup.enter="userPasswordSubmit"
          input-class="w-full"
          :feedback="false"
          toggleMask
          autofocus
        />
      </IconField>

      <Message
        v-if="isUserPasswordError"
        size="small"
        severity="error"
        variant="simple"
        class="mt-2"
      >
        Неверный пароль.
      </Message>
    </div>
    <div class="flex justify-end gap-3">
      <Button
        type="button"
        label="Закрыть"
        severity="secondary"
        @click="isUserPasswordDialogVisible = false"
      ></Button>
      <Button
        type="button"
        label="Подтвердить"
        @click="userPasswordSubmit"
        :disabled="userPassword === ''"
      ></Button>
    </div>
  </Dialog>
</template>
