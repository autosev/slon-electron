<script lang="ts" setup>
import InvoiceArrival from './InvoiceArrival.vue'
import InvoiceExpenditure from './InvoiceExpenditure.vue'
import ProductPriceTagEditor from './ProductPriceTagEditor.vue'
import SellerHelper from './SellerHelper.vue'

const props = defineProps<{
  selectedPanelKey: string | null
}>()
const emit = defineEmits(['update:selectedPanelKey'])

const panelOptions = [
  {
    title: 'Приходная накладная',
    key: 'invoice-arrival',
    content: InvoiceArrival,
  },
  {
    title: 'Расходная накладная',
    key: 'invoice-expenditure',
    content: InvoiceExpenditure,
  },
  {
    title: 'Помощник продавца',
    key: 'seller-helper',
    content: SellerHelper,
  },
  {
    title: 'Редактор ценников',
    key: 'product-price-tag-editor',
    content: ProductPriceTagEditor,
  },
]
const selectedPanel = computed(() =>
  props.selectedPanelKey !== null
    ? panelOptions.find((panel) => panel.key === props.selectedPanelKey) || null
    : null,
)

function close() {
  emit('update:selectedPanelKey', null)
}

function escKeyClose({ key }: { key: string }) {
  if (key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', escKeyClose)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', escKeyClose)
})

const dialog = useDialog()
function openDialog() {
  if (!selectedPanel.value) {
    return
  }

  // const selectedPanelKey = selectedPanel.value.key
  const selectedPanelContent = selectedPanel.value.content
  const selectedPanelTitle = selectedPanel.value.title

  dialog.open(selectedPanelContent, {
    props: {
      modal: true,
      header: selectedPanelTitle,
      pt: { root: 'w-screen	h-screen !rounded-none	!max-h-max !bg-surface-100 dark:!bg-surface-900' },
      draggable: false,
    },
    // onClose: () => {
    //   console.log(selectedPanelKey)
    //   emit('update:selectedPanelKey', selectedPanelKey)
    // },
  })

  // close()
}
</script>

<template>
  <div v-show="selectedPanel !== null">
    <div class="h-full bg-surface-100 dark:bg-surface-900 border-t border-b border-surface">
      <div class="flex justify-between items-center h-[64px] px-6">
        <div>
          <h2>{{ selectedPanel?.title }}</h2>
          <!-- <span
            class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1"
            >Ctrl+Shift+G</span
          > -->
        </div>
        <div>
          <Button
            icon="pi pi-window-maximize"
            severity="secondary"
            variant="text"
            aria-label="Развернуть"
            @click="openDialog"
            class="mr-3"
            rounded
          />
          <Button
            icon="pi pi-times"
            severity="secondary"
            variant="text"
            aria-label="Закрыть"
            @click="close"
            rounded
          />
        </div>
      </div>
      <div class="overflow-auto h-panel px-6" style="scrollbar-gutter: stable">
        <div class="mb-6">
          <KeepAlive>
            <component :is="selectedPanel?.content" />
          </KeepAlive>
        </div>
      </div>
    </div>
  </div>
</template>
