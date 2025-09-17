<script setup lang="ts">
const { supabase } = useSupabase()
const { getUsers, addUser, endSession } = useAuth()
const { phoneStrip } = useTools()
const router = useRouter()
const toast = useToast()

const users = ref(getUsers())

const userPhone = ref('')
const otpCode = ref('')
const isLoading = ref(false)

const pages = [
  {
    id: 1,
    title: 'Добро пожаловать',
    description: 'Введите номер телефона',
  },
  {
    id: 2,
    title: 'Подтверждение входа',
    description: 'Введите шестизначный код из сообщения в Telegram',
  },
]
const currentPageIndex = ref(0)

async function submitPhone() {
  const phone = phoneStrip(userPhone.value)
  if (phone.length === 11) {
    isLoading.value = true
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+${phone}`,
      options: {
        shouldCreateUser: false,
      },
    })
    isLoading.value = false
    if (error !== null) {
      if (error.code === 'otp_disabled') {
        toast.add({
          severity: 'error',
          summary: 'Нет доступа',
          detail: 'В системе нет такого сотрудника. Обратитесь к администратору.',
          life: 5000,
        })
      } else if (error.code === 'over_sms_send_rate_limit') {
        currentPageIndex.value = 1
      } else {
        toast.add({
          severity: 'error',
          summary: error.code,
          detail: error.message,
          life: 5000,
        })
      }
    } else {
      currentPageIndex.value = 1
    }
  }
}

async function submit() {
  const phone = phoneStrip(userPhone.value)
  if (phone.length === 11 && otpCode.value.length === 6) {
    isLoading.value = true
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otpCode.value,
      type: 'sms',
    })
    isLoading.value = false
    console.log('Это дата', data, error)
    if (error !== null) {
      if (error.code === '422') {
        toast.add({
          severity: 'error',
          summary: 'Нет доступа',
          detail: 'В системе нет такого сотрудника. Обратитесь к администратору.',
          life: 5000,
        })
      }
    } else if (data.session) {
      addUser(data.session)
      endSession()
      router.push({ name: 'welcome' })
    }
  }
}

function goBack() {
  currentPageIndex.value = 0
}
</script>

<template>
  <div class="flex w-full h-full">
    <div class="flex flex-col w-2/6 bg-sky-100 justify-center items-center">
      <h1 class="font font-medium">{{ pages[currentPageIndex].title }}</h1>
      <span class="text-slate-600">{{ pages[currentPageIndex].description }}</span>
    </div>
    <div class="card flex w-4/6 justify-center items-center">
      <Transition
        mode="out-in"
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="currentPageIndex === 0" class="flex flex-col gap-3 w-64">
          <div class="card flex justify-center">
            <InputMask
              inputId="on_label_phone"
              v-model="userPhone"
              placeholder="+7 (___) ___-__-__"
              mask="+7 (999) 999-99-99"
              :disabled="isLoading"
              fluid
            />
          </div>
          <Button
            type="submit"
            label="Далее"
            iconPos="right"
            icon="pi pi-arrow-right"
            @click="submitPhone"
            :loading="isLoading"
            :disabled="phoneStrip(userPhone).length !== 11"
            class="mt-1"
          />
          <Button
            v-if="users.length > 0"
            type="submit"
            severity="secondary"
            label="Выбрать пользователя"
            icon="pi pi-users"
            @click="router.push({ name: 'welcome' })"
            :disabled="isLoading"
          />
        </div>
        <div v-else-if="currentPageIndex === 1" class="flex flex-col gap-3">
          <span class="m-auto">Код из сообщения в Telegram</span>
          <InputOtp v-model="otpCode" :length="6" :disabled="isLoading" integerOnly />
          <Button
            type="submit"
            label="Подтвердить"
            @click="submit"
            :loading="isLoading"
            class="mt-1"
          />
          <Button
            type="submit"
            severity="secondary"
            label="Назад"
            @click="goBack"
            :disabled="isLoading"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>
