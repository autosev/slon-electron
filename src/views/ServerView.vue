<script setup lang="ts">
const router = useRouter()
const { getUsers } = useAuth()

const users = ref(getUsers()) // getServers
</script>

<template>
  <div class="flex w-full h-full">
    <div class="flex flex-col w-2/6 bg-slate-100 justify-center items-center gap-4">
      <i class="pi pi-server !text-2xl"></i>
      <div>
        <h1 class="font font-medium text-center">Начальная настройка</h1>
        <p class="text-slate-600 text-center">
          Подключитесь к своему облачному серверу или создайте новый. <br />
        </p>
      </div>
      <div></div>
    </div>
    <div class="card flex w-4/6 justify-center items-center">
      <div class="flex flex-col gap-4">
        <Button
          label="Добавить подключение"
          icon="pi pi-arrow-right-arrow-left"
          @click="router.push({ name: 'server-connect' })"
          fluid
        />
        <Button
          label="Создать новый сервер"
          icon="pi pi-sliders-h"
          severity="contrast"
          variant="outlined"
          @click="router.push({ name: 'server-deploy' })"
          fluid
        />
        <Button
          v-if="users.length > 0"
          type="submit"
          severity="secondary"
          label="Выбрать пользователя"
          icon="pi pi-users"
          @click="router.push({ name: 'welcome' })"
        />
      </div>
    </div>
  </div>
  <!-- <div class="h-screen flex flex-col justify-center">
    <div class="m-auto">
      <img src="/icon.png" alt="Логотип" width="128" height="128" class="m-auto animate-bounce" />
      <div class="flex gap-3 flex-col mt-8">
        <Button label="Добавить подключение" icon="pi pi-plus" fluid />
        <Button
          label="Создать новый сервер"
          icon="pi pi-sliders-h"
          severity="contrast"
          variant="outlined"
          @click="router.push({ name: 'server-deploy' })"
          fluid
        />
        <Button
          v-if="users.length > 0"
          type="submit"
          severity="secondary"
          label="Выбрать пользователя"
          icon="pi pi-users"
          @click="router.push({ name: 'welcome' })"
        />
      </div>
    </div>
  </div> -->
</template>
