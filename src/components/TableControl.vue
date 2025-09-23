<script lang="ts" setup>
import CollectionExplorer from './CollectionExplorer.vue'
import AnalyseImplementation from './AnalyseImplementation.vue'
import EmployeeExplorer from './EmployeeExplorer.vue'
import Settings from './Settings.vue'

const filterOptions: FilterOption[] = ['Все', 'В наличии', 'Нет на сайте']

const tableStore = useTableStore()
const {
  setSelectedStockId,
  setSelectedFilterOption,
  setSelectedProductItemId,
  setSelectedTablePanel,
} = tableStore
const { selectedStockId, selectedCollectionId, selectedFilterOption, selectedTablePanel } =
  storeToRefs(tableStore)

const clientStore = useClientStore()
const { hasCurrentUserPermission } = clientStore
const { isOnline, currentEmployee } = storeToRefs(clientStore)

const invoiceArrivalStore = useInvoiceArrivalStore()
const { editorData: IAEditorData } = storeToRefs(invoiceArrivalStore)

const invoiceExpenditureStore = useInvoiceExpenditureStore()
const { editorData: IEEditorData } = storeToRefs(invoiceExpenditureStore)

const selectedSidebarKey = ref<SidebarItem['key'] | null>('collections')
const sidebarOptions = [
  {
    title: 'Коллекции',
    hideTitle: true,
    key: 'collections',
    iconClass: 'pi pi-book',
    content: CollectionExplorer,
    position: 'top',
  },
  {
    title: 'Сотрудники',
    key: 'employees',
    iconClass: 'pi pi-address-book',
    content: EmployeeExplorer,
    position: 'top',
    hideTitle: true,
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
  //   content: EmployeeManagement,
  //   position: 'top',
  //   disabled: !hasCurrentUserPermission('list_users'),
  //   onlineOnly: true,
  // },
  {
    title: 'Аналитика',
    key: 'analytics',
    iconClass: 'pi pi-chart-bar',
    content: AnalyseImplementation,
    position: 'top',
    // disabled: !hasCurrentUserPermission('list_users'),
    onlineOnly: true,
  },
  // {
  //   title: 'Уведомления',
  //   key: 'notification',
  //   iconClass: 'pi pi-bell',
  //   badge: notificationsUnreadCount,
  //   content: Notifications,
  //   position: 'bottom',
  // },
  {
    title: 'Настройки',
    key: 'settings',
    iconClass: 'pi pi-cog',
    content: Settings,
    position: 'bottom',
  },
] as SidebarItem[]

const quickFilterValue = ref('')

function updateSelectedFilterOption(filterOption: FilterOption) {
  setSelectedProductItemId(null)
  setSelectedFilterOption(filterOption)
}

// function handleKeydown(event: KeyboardEvent) {
//   if (event.ctrlKey && event.shiftKey) {
//     if (event.key.toLowerCase() === 'g') {
//       setSelectedTablePanel('invoice-arrival')
//     } else if (event.key.toLowerCase() === 'h') {
//       setSelectedTablePanel('invoice-expenditure')
//     }
//   }
// }

// onMounted(() => {
//   window.addEventListener('keydown', handleKeydown)
// })

// onBeforeUnmount(() => {
//   window.removeEventListener('keydown', handleKeydown)
// })
</script>

<template>
  <div class="flex">
    <SidebarController v-model:selectedKey="selectedSidebarKey" :options="sidebarOptions" />
    <Splitter class="w-full" :gutterSize="selectedSidebarKey !== null ? 2 : 0" pt:root="!border-0">
      <SplitterPanel v-show="selectedSidebarKey !== null" :size="15" :minSize="13">
        <Sidebar :selectedKey="selectedSidebarKey" :options="sidebarOptions" />
      </SplitterPanel>
      <SplitterPanel :size="80" :minSize="70">
        <div>
          <!-- Header -->
          <div
            class="flex justify-between items-center h-[64px] bg-surface-50 dark:bg-surface-900 border-l border-surface"
          >
            <div class="flex p-4 gap-3">
              <IconField>
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText
                  v-model="quickFilterValue"
                  placeholder="Поиск по коллекции"
                  :disabled="selectedCollectionId === 0"
                  showClear
                />
              </IconField>
              <StockSelect
                v-show="selectedStockId !== null"
                :id="selectedStockId"
                @update:id="setSelectedStockId"
                :disabled="
                  (IAEditorData.invoice.recipient_stock_id !== null &&
                    selectedTablePanel === 'invoice-arrival') ||
                  (IEEditorData.invoice.sender_stock_id !== null &&
                    selectedTablePanel === 'invoice-expenditure')
                "
                :optionDisabled="
                  (data: Stock) => isOnline === false && data.id !== currentEmployee?.stock_id
                "
              />
            </div>
            <div class="flex p-4 gap-3">
              <Button
                label="Приход"
                :badge="
                  IAEditorData.items.length > 0 &&
                  (IAEditorData.invoice.status === 'new' || IAEditorData.invoice.status === 'draft')
                    ? String(IAEditorData.items.length)
                    : ''
                "
                badgeSeverity="contrast"
                icon="pi pi-plus"
                :severity="selectedTablePanel === 'invoice-arrival' ? 'contrast' : undefined"
                variant="outlined"
                @click="
                  selectedTablePanel === 'invoice-arrival'
                    ? setSelectedTablePanel(null)
                    : setSelectedTablePanel('invoice-arrival')
                "
              />
              <Button
                label="Расход"
                :badge="
                  IEEditorData.items.length > 0 &&
                  (IEEditorData.invoice.status === 'new' ||
                    IEEditorData.invoice.status === 'draft' ||
                    IEEditorData.invoice.status === 'prior')
                    ? String(IEEditorData.items.length)
                    : ''
                "
                badgeSeverity="contrast"
                icon="pi pi-minus"
                :severity="selectedTablePanel === 'invoice-expenditure' ? 'contrast' : undefined"
                variant="outlined"
                @click="
                  selectedTablePanel === 'invoice-expenditure'
                    ? setSelectedTablePanel(null)
                    : setSelectedTablePanel('invoice-expenditure')
                "
              />
              <OtherMenuButton @update:selectedPanel="setSelectedTablePanel" />
            </div>
          </div>
          <div class="flex">
            <Splitter class="w-full" :gutterSize="2" pt:root="!border-0">
              <SplitterPanel :size="35" :minSize="25">
                <Table :quickFilterValue="quickFilterValue" />
              </SplitterPanel>
              <SplitterPanel
                v-if="selectedTablePanel !== null"
                :size="65"
                :minSize="50"
                class="basis-[65%] select-none"
              >
                <Panel
                  :selectedPanelKey="selectedTablePanel"
                  @update:selectedPanelKey="setSelectedTablePanel"
                />
              </SplitterPanel>
            </Splitter>
          </div>
          <!-- Footer -->
          <div
            class="flex justify-between p-4 h-[64px] bg-surface-50 dark:bg-surface-900 border-l border-surface"
          >
            <div class="flex gap-3">
              <FindByBarcodeButton />
              <CreateProductButton v-if="hasCurrentUserPermission('product.create')" />
              <Button
                v-if="selectedFilterOption === 'В наличии'"
                label="Печать"
                icon="pi pi-print"
                severity="primary"
                variant="outlined"
              />
            </div>
            <div>
              <SelectButton
                :defaultValue="selectedFilterOption"
                :options="filterOptions"
                :allowEmpty="false"
                @value-change="updateSelectedFilterOption"
              />
            </div>
          </div>
        </div>
      </SplitterPanel>
    </Splitter>
  </div>
</template>
