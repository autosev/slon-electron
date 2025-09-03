<script lang="ts" setup>
import { Button } from 'primevue'
import { version } from '../package.json'
import ReleaseNotes from './components/ReleaseNotes.vue'
import { useDialog } from 'primevue/usedialog'
import { MenuItem } from 'primevue/menuitem'

const { updateSession, endSession } = useAuth()

const clientStore = useClientStore()
const { updateClientOnlineStatus, getClientVersion, setClientVersion } = clientStore
const { isClientOnline, isServerOnline, lastSyncDate, isSyncing, isOnline } =
  storeToRefs(clientStore)

const { syncManager } = useSignalDB()
const dialog = useDialog()
const route = useRoute()

const statusMenu = useTemplateRef('statusMenu')
const statusMenuOptions = computed(
  () =>
    [
      {
        label: 'Статус подключений',
        items: [
          {
            label: 'Клиент',
            icon: 'pi pi-globe',
            status: isClientOnline.value,
          },
          {
            label: 'Сервер',
            icon: 'pi pi-server',
            status: isClientOnline.value === true ? isServerOnline.value : null,
          },
        ],
      },
    ] as MenuItem[],
)

function showStatusMenu(event: Event) {
  statusMenu.value?.toggle(event)
}

function openReleaseNotesDialog() {
  const okButtonLabel = [
    'Погнали! 🚀',
    'Круто! 😎',
    'Закрыть и вперёд! 👉',
    'Хорошо, я в деле 💼',
    'Ну, круто! 😎',
    'Понятно, спасибо 🙏',
    'Давай дальше ➡️',
    'Вперёд к новым багам! 🐛',
    'Ждал этого! ⏳',
    'Круто, закрывай 👍',
    'Пора поработать 💻',
    'Ура, исправили! 🛠️',
    'Слава программистам 👨‍💻',
    'Наконец-то обновили 🎉',
    'Дальше будет только лучше 🌟',
    'Наконец-то новые баги 🐞',
    'Это было мощно 💥',
    'Обновление принято 🤝',
    'Великолепно 💫',
    'С возвращением! 👋',
    'Да будет код! 🧙‍♂️',
    'Миссия выполнена ✅',
    'Звучит как прогресс 📈',
    'Крутая работа 👌',
    'Тестируем дальше 🧪',
    'Ну-ну 😁',
  ]
  const dialogRef = dialog.open(ReleaseNotes, {
    props: {
      modal: true,
      header: `Версия ${version}: Что нового?`,
      style: { width: '500px' },
      draggable: false,
    },
    templates: {
      footer: h(Button, {
        label: okButtonLabel[Math.floor(Math.random() * okButtonLabel.length)],
        fluid: true,
        onClick: (e: MouseEvent) => dialogRef.close(e),
      }),
    },
  })
}

onMounted(() => {
  updateClientOnlineStatus()

  const { supabase } = useSupabase()
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      console.log('SIGNED_IN', session)
    } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
      if (session !== null) {
        updateSession(session)
      }
    }
  })

  window.addEventListener('online', () => {
    syncManager.syncAll()
    updateClientOnlineStatus()
  })
  window.addEventListener('offline', updateClientOnlineStatus)

  if (getClientVersion() !== version) {
    setClientVersion(version)
    openReleaseNotesDialog()
  }
})

onUnmounted(() => {
  endSession()
})
</script>

<template>
  <DynamicDialog />
  <ConfirmDialog />
  <Toast position="top-center" />

  <div class="h-workspace font-base">
    <router-view />
  </div>
  <div class="bg-slate-400 h-[20px] text-[11px] flex justify-between items-center text-slate-800">
    <div class="flex items-center">
      <Menu ref="statusMenu" :model="statusMenuOptions" popup>
        <template #item="{ item, props }">
          <a v-ripple class="flex items-center" v-bind="props.action">
            <i
              :class="{
                [item.icon ?? '']: true,
                'text-green-500': item.status === true,
                'text-red-500': item.status === false,
                'text-slate-500': item.status === null,
              }"
            />
            <span>{{ item.label }}</span>
          </a>
        </template>
      </Menu>
      <div
        class="flex h-[20px] px-[12px] items-center cursor-pointer select-none"
        :class="
          isOnline === true ? 'bg-green-300 hover:bg-green-200' : 'bg-red-300 hover:bg-red-200'
        "
        @click="showStatusMenu"
      >
        <span v-if="isClientOnline === false">Нет Интернета</span>
        <span v-else-if="isServerOnline === false">Сервер не в сети</span>
        <span v-else>В сети</span>
      </div>
      <!-- <div
        class="flex h-[20px] px-[12px] items-center gap-[8px] hover:bg-slate-300 cursor-pointer select-none"
      >
        <i class="pi pi-server !text-[11px]"></i>
        <span> sb.autopilot-sev.ru </span>
      </div> -->
      <div
        v-if="lastSyncDate !== null && route.name === 'workspace'"
        class="flex h-[20px] px-[12px] items-center gap-[8px] hover:bg-slate-300 cursor-pointer select-none"
        @click="syncManager.syncAll()"
      >
        <i class="pi pi-sync !text-[11px]" :class="{ 'pi-spin': isSyncing }"></i>
        <span>
          Синхронизация:
          {{
            lastSyncDate.toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          }}
        </span>
      </div>
    </div>
    <div
      class="flex h-[20px] px-[12px] items-center hover:bg-slate-300 cursor-pointer select-none"
      @click="openReleaseNotesDialog()"
    >
      <span>Версия: {{ version }}</span>
    </div>
  </div>
</template>
