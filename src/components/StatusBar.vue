<script lang="ts" setup>
import { version } from '../../package.json'

const route = useRoute()
const clientStore = useClientStore()
const { isDark, toggleTheme } = useTheme()
const { isClientOnline, isServerOnline, lastSyncDate, isSyncing, isOnline } =
  storeToRefs(clientStore)

// const isDarkMode = ref(false)

// function toggleDarkMode() {
//   if (isDarkMode.value === true) {
//     document.body.dataset.agThemeMode = 'app-light'
//   } else {
//     document.body.dataset.agThemeMode = 'app-dark'
//   }
//   isDarkMode.value = !isDarkMode.value
//   document.documentElement.classList.toggle('app-dark')
// }

// onMounted(() => {
//   isDarkMode.value = document.documentElement.classList.contains('app-dark')
//   toggleDarkMode()
// })
</script>

<template>
  <div
    class="h-[20px] text-xs flex justify-between items-center bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-color border-t border-surface select-none"
  >
    <div
      class="flex items-center h-full divide-x divide-surface-200 dark:divide-surface-700 border-r border-surface cursor-pointer"
    >
      <div
        class="flex items-center gap-2 h-full px-3 hover:bg-surface-200 active:bg-surface-300 dark:hover:bg-surface-700 dark:active:bg-surface-600"
      >
        <template v-if="isClientOnline && isServerOnline">
          <i class="pi pi-circle-fill !text-xs text-green-400"></i>
          <span>В сети</span>
        </template>
        <template v-else>
          <i class="pi pi-circle-fill !text-xs text-red-400"></i>
          <span v-if="isClientOnline === false">Нет Интернета</span>
          <span v-else>Сервер не в сети</span>
        </template>
      </div>
      <!-- <Menu ref="statusMenu" :model="statusMenuOptions" popup>
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
        class="flex h-[20px] px-[12px] items-center cursor-pointer select-none text-color"
        :class="
          isOnline === true
            ? 'bg-green-300 hover:bg-green-200 dark:bg-green-600 dark:hover:bg-green-700'
            : 'bg-red-300 hover:bg-red-200'
        "
        @click="showStatusMenu"
      >
        <span v-if="isClientOnline === false">Нет Интернета</span>
        <span v-else-if="isServerOnline === false">Сервер не в сети</span>
        <span v-else>В сети</span>
      </div> -->
      <div
        v-if="lastSyncDate !== null && route.name === 'workspace'"
        class="flex items-center gap-2 h-full px-3 hover:bg-surface-200 active:bg-surface-300 dark:hover:bg-surface-700 dark:active:bg-surface-600"
        @click="syncManager.syncAll()"
      >
        <i class="pi pi-sync !text-xs" :class="{ 'pi-spin': isSyncing }"></i>
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
      class="flex items-center h-full divide-x divide-surface-200 dark:divide-surface-700 border-l border-surface cursor-pointer"
    >
      <div
        class="flex items-center gap-2 h-full px-3 hover:bg-surface-200 active:bg-surface-300 dark:hover:bg-surface-700 dark:active:bg-surface-600"
        @click="toggleTheme"
      >
        <i class="pi !text-xs" :class="isDark ? 'pi-moon' : 'pi-sun'"></i>
        <span>{{ isDark ? 'Тёмный режим' : 'Светлый режим' }}</span>
      </div>
      <div
        class="flex items-center gap-2 h-full px-3 hover:bg-surface-200 active:bg-surface-300 dark:hover:bg-surface-700 dark:active:bg-surface-600"
        @click="openReleaseNotesDialog()"
      >
        <i class="pi pi-code !text-xs"></i>
        <span>Версия: {{ version }}</span>
      </div>
    </div>
  </div>
</template>
