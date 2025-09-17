<script setup lang="ts">
const router = useRouter()
const toast = useToast()
</script>

<template>
  <div class="flex w-full h-full">
    <div class="flex flex-col w-2/6 bg-slate-100 justify-center items-center gap-4">
      <i class="pi pi-arrow-right-arrow-left !text-2xl"></i>
      <div>
        <h1 class="font font-medium text-center">Добавить подключение</h1>
        <p class="text-slate-600 text-center mx-5">
          Подключитесь к предварительно настроенному серверу для работы.
        </p>
      </div>
      <div></div>
    </div>
    <div class="card flex w-4/6 justify-center items-center">
      <div class="flex flex-col gap-4 max-w-64">
        <!-- <div class="flex gap-4">
          <IftaLabel>
            <InputText
              placeholder="255.255.255.255"
              minlength="7"
              maxlength="15"
              id="server_ip_address"
              fluid
            />
            <label for="server_ip_address">IP адрес</label>
          </IftaLabel>
          <IftaLabel>
            <InputNumber
              placeholder="22"
              :min="0"
              :max="65535"
              input-class="w-20"
              id="server_port"
            />
            <label for="server_port">Порт</label>
          </IftaLabel>
        </div>
        <IftaLabel>
          <InputText placeholder="root" minlength="7" maxlength="15" id="ip_ssh_login" fluid />
          <label for="ip_ssh_login">Пользователь SSH</label>
        </IftaLabel> -->
        <FloatLabel variant="on">
          <InputText id="on_server_name" :feedback="false" toggleMask fluid />
          <label for="on_server_name">Название подключения</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <InputText id="on_api_url" :feedback="false" toggleMask fluid />
          <label for="on_api_url">API URL</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <Password id="on_anon_key" :feedback="false" toggleMask fluid />
          <label for="on_anon_key">Открытый ключ</label>
        </FloatLabel>
        <Button label="Добавить" icon="pi pi-plus" />
        <Button
          type="submit"
          severity="secondary"
          label="Начальная настройка"
          icon="pi pi-server"
          @click="router.push({ name: 'server' })"
        />
      </div>
    </div>
  </div>
</template>
