<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <div class="flex w-full h-full">
    <div class="flex flex-col w-2/6 bg-slate-100 justify-center items-center gap-4">
      <i class="pi pi-sliders-h !text-2xl"></i>
      <div>
        <h1 class="font font-medium text-center">Создание нового сервера</h1>
        <p class="text-slate-600 text-center">Настройте свой сервер для работы. <br /></p>
      </div>
      <div>
        <Fieldset legend="Минимальные требования">
          <ul class="list-disc ml-5">
            <li>ОС: Ubuntu 22.04</li>
            <li>CPU: 2 core</li>
            <li>RAM: 4Gb</li>
          </ul>
        </Fieldset>
      </div>
    </div>
    <div class="card flex w-4/6 justify-center items-center">
      <div class="flex flex-col gap-4 max-w-64">
        <div class="flex gap-4">
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
        </IftaLabel>
        <FloatLabel variant="on">
          <Password id="on_ip_ssh_password" :feedback="false" toggleMask fluid />
          <label for="on_ip_ssh_password">Пароль SSH</label>
        </FloatLabel>
        <Button label="Продолжить" iconPos="right" icon="pi pi-arrow-right" />
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
