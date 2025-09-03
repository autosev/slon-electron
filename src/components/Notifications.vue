<script setup lang="ts">
import { Panel as PrimevuePanel } from 'primevue'

const notificationStore = useNotificationStore()
const { markNotificationsAsRead } = notificationStore
const { notifications, notificationsUnreadCount } = storeToRefs(notificationStore)
</script>

<template>
  <div>
    <div v-if="notifications.length > 0">
      <div v-if="notificationsUnreadCount > 0" class="px-5 pb-5">
        <Button
          label="Прочитано"
          icon="pi pi-check-square"
          severity="contrast"
          variant="outlined"
          @click="markNotificationsAsRead"
          fluid
        />
      </div>
      <div v-else class="h-[54px] text-center select-none italic">Новых уведомлений нет</div>
      <div
        v-for="notification in notifications"
        class="p-5 text-sm border-b border-t border-slate-200 hover:bg-slate-50 cursor-pointer select-none"
        :class="notification.userRead === undefined ? 'text-slate-900' : 'text-slate-500'"
      >
        <h3 class="font-bold">{{ notification.title }}</h3>
        <p class="my-1">{{ notification.body }}</p>
        <div class="flex justify-between">
          <span class="font-medium">{{
            new Date(notification.timestamp).toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          }}</span>
          <div
            v-if="notification.userRead !== undefined"
            v-tooltip.bottom="{ value: `Прочитано ${notification.userRead.name}` }"
          >
            <UserAvatar :userId="notification.userRead.id" :size="16" />
          </div>
        </div>
      </div>
    </div>
    <PrimevuePanel v-else header="Пока пусто" class="mx-6">
      <p class="m-0">Тут будут храниться все уведомления.</p>
    </PrimevuePanel>
  </div>
</template>
