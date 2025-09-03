<script lang="ts" setup>
import { Panel as PrimevuePanel } from 'primevue'
import CollectionExplorer from './CollectionExplorer.vue'
import UserManagement from './EmployeeManagement.vue'
import Settings from './Settings.vue'
import Notifications from './Notifications.vue'
import FAQ from './FAQ.vue'
import AnalyseImplementation from './AnalyseImplementation.vue'
import { MenuItem } from 'primevue/menuitem'

const clientStore = useClientStore()
const { hasCurrentUserPermission } = clientStore
const { currentUser, isOnline } = storeToRefs(clientStore)

const tableStore = useTableStore()
const { setSelectedProductItemId } = tableStore
const { selectedProductItemId, selectedStockId } = storeToRefs(tableStore)

const notificationStore = useNotificationStore()
const { notificationsUnreadCount } = storeToRefs(notificationStore)

const { getEmployeeFullName } = useTools()

const router = useRouter()

const panelOptions = [
  {
    title: 'Коллекции',
    hideTitle: true,
    key: 'collections',
    iconClass: 'pi pi-book',
    content: CollectionExplorer,
    position: 'top',
  },
  // {
  //   // Только Автопилот
  //   title: 'Веб-сайт',
  //   key: 'website',
  //   iconClass: 'pi pi-globe',
  //   // badge: 5,
  //   content: CollectionExplorer,
  //   position: 'top',
  //   disabled: currentUser.value?.session.user.user_metadata.stockId !== 1,
  // },
  // {
  //   title: 'Склады',
  //   key: 'stocks',
  //   iconClass: 'pi pi-warehouse',
  //   content: () => h(CollectionExplorer),
  //   position: 'top',
  //   disabled: getUserRole() !== 'admin',
  // },
  // {
  //   title: 'Клиенты',
  //   key: 'customers',
  //   iconClass: 'pi pi-address-book',
  //   content: UserManagement,
  //   position: 'top',
  //   disabled: !hasCurrentUserPermission('list_users'),
  //   onlineOnly: true,
  // },
  // {
  //   title: 'Аналитика',
  //   key: 'analytics',
  //   iconClass: 'pi pi-chart-bar',
  //   content: AnalyseImplementation,
  //   position: 'top',
  //   disabled: !hasCurrentUserPermission('list_users'),
  //   onlineOnly: true,
  // },
  {
    title: 'Сотрудники',
    key: 'employees',
    iconClass: 'pi pi-users',
    content: UserManagement,
    position: 'top',
    // disabled: !hasCurrentUserPermission('app.employees_list.show'),
    onlineOnly: true,
  },
  {
    title: 'Уведомления',
    key: 'notification',
    iconClass: 'pi pi-bell',
    badge: notificationsUnreadCount,
    content: Notifications,
    position: 'bottom',
  },
  {
    title: 'Настройки',
    key: 'settings',
    iconClass: 'pi pi-cog',
    content: Settings,
    position: 'bottom',
  },
] as ControlPanelItem[]

const selectedPanelKey = ref<ControlPanelItem['key'] | null>('collections')
const selectedPanel = computed(() =>
  selectedPanelKey.value !== null
    ? panelOptions.find((panel) => panel.key === selectedPanelKey.value) || null
    : null,
)

const userMenu = useTemplateRef('userMenu')
const userMenuItems = ref<MenuItem[]>([])

function toggle(event: Event) {
  if (userMenuItems.value.length === 0) {
    userMenuItems.value = [
      {
        label: getEmployeeFullName(currentUser.value?.id),
        items: [
          {
            label: 'Переключить',
            icon: 'pi pi-users',
            command: () => router.push({ name: 'welcome' }),
          },
          {
            label: 'Добавить',
            icon: 'pi pi-user-plus',
            command: () => router.push({ name: 'login' }),
          },
        ],
      },
    ]
  }
  userMenu.value?.toggle(event)
}

function showSelectedProductItem() {
  const productItemId = selectedProductItemId.value
  setSelectedProductItemId(null)
  nextTick(() => {
    setSelectedProductItemId(productItemId)
  })
}
</script>

<template>
  <div class="flex h-full">
    <div class="w-14 bg-slate-300 flex flex-col justify-between items-center">
      <div class="flex flex-col items-center">
        <ControlPanelButton
          v-for="panel in panelOptions.filter((p) => p.position === 'top')"
          :key="panel.key"
          v-model:selectedPanelKey="selectedPanelKey"
          :panel="panel"
        />
      </div>
      <div class="flex flex-col items-center">
        <ControlPanelButton
          v-for="panel in panelOptions.filter((p) => p.position === 'bottom')"
          :key="panel.key"
          v-model:selectedPanelKey="selectedPanelKey"
          :panel="panel"
        />
        <div v-if="currentUser !== null && typeof currentUser.session !== 'string'">
          <div
            class="flex w-14 h-14"
            @click="toggle"
            v-tooltip="{
              value:
                currentUser?.session.user.user_metadata.first_name +
                ' ' +
                currentUser?.session?.user.user_metadata.last_name,
            }"
          >
            <UserAvatar :userId="currentUser.id" :size="32" class="m-auto" />
          </div>
          <Menu ref="userMenu" :model="userMenuItems" popup />
        </div>
      </div>
    </div>
    <div
      v-show="selectedPanel !== null"
      class="flex flex-col h-full justify-between bg-slate-100 w-full"
    >
      <!-- <div> -->
      <div v-if="selectedPanel?.hideTitle !== true" class="h-[64px] flex items-center px-6">
        <h2>{{ selectedPanel?.title }}</h2>
      </div>
      <!-- <div class="w-64"> -->
      <PrimevuePanel
        v-if="selectedPanel?.onlineOnly === true && isOnline === false"
        header="Недоступно"
        class="mx-6"
      >
        <p class="m-0">Восстановите доступ к сети Интернет.</p>
      </PrimevuePanel>
      <KeepAlive v-else>
        <component
          :is="selectedPanel?.content"
          :class="
            selectedProductItemId === null
              ? 'h-control-panel-content'
              : 'h-control-panel-content-low'
          "
          class="overflow-auto"
        />
      </KeepAlive>
      <!-- </div> -->
      <!-- </div> -->
      <ProductPricePanel
        v-if="selectedProductItemId !== null && selectedStockId !== null"
        :productItemId="selectedProductItemId"
        :stockId="selectedStockId"
        @close="setSelectedProductItemId(null)"
        @show-selected="showSelectedProductItem()"
      />
    </div>
  </div>
</template>
