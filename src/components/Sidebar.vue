<script lang="ts" setup>
import { Panel as PrimevuePanel } from 'primevue'

const props = defineProps<{ selectedKey: SidebarItem['key'] | null; options: SidebarItem[] }>()

const clientStore = useClientStore()
const { hasCurrentUserPermission } = clientStore
const { currentUser, isOnline } = storeToRefs(clientStore)

const tableStore = useTableStore()
const { setSelectedProductItemId } = tableStore
const { selectedProductItemId, selectedStockId } = storeToRefs(tableStore)

const notificationStore = useNotificationStore()
const { notificationsUnreadCount } = storeToRefs(notificationStore)

const selectedPanel = computed(() =>
  props.selectedKey !== null
    ? props.options.find((panel) => panel.key === props.selectedKey) || null
    : null,
)

function showSelectedProductItem() {
  const productItemId = selectedProductItemId.value
  setSelectedProductItemId(null)
  nextTick(() => {
    setSelectedProductItemId(productItemId)
  })
}
</script>

<template>
  <div
    v-show="selectedPanel !== null"
    class="flex flex-col h-full justify-between bg-surface-100 dark:bg-surface-900 w-full"
  >
    <div v-if="selectedPanel?.hideTitle !== true" class="h-[64px] flex items-center px-6">
      <h2>{{ selectedPanel?.title }}</h2>
    </div>

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
          selectedProductItemId === null ? 'h-control-panel-content' : 'h-control-panel-content-low'
        "
        class="overflow-auto"
      />
    </KeepAlive>

    <ProductPricePanel
      v-if="selectedProductItemId !== null && selectedStockId !== null"
      :productItemId="selectedProductItemId"
      :stockId="selectedStockId"
      @close="setSelectedProductItemId(null)"
      @show-selected="showSelectedProductItem()"
    />
  </div>
</template>
