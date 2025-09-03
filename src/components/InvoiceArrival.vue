<script setup lang="ts">
const invoiceArrivalStore = useInvoiceArrivalStore()
const { createEditor, openDraft } = invoiceArrivalStore
const { selectedTab, editorData, drafts } = storeToRefs(invoiceArrivalStore)

const tabs = [
  { label: 'editor', title: 'Редактор', icon: 'pi pi-pen-to-square' },
  {
    label: 'drafts',
    title: 'Черновики',
    icon: 'pi pi-file',
    badge: computed(() => drafts.value.size),
  },
  { label: 'history', title: 'История', icon: 'pi pi-clock' },
]

onActivated(() => {
  if (editorData.value.invoice.recipient_stock_id !== null) {
    useTableStore().setSelectedStockId(editorData.value.invoice.recipient_stock_id)
  }
})
</script>

<template>
  <Tabs v-model:value="selectedTab" scrollable>
    <TabList :pt="{ tablist: 'rounded-t-md', root: '!sticky top-0 z-10' }">
      <Tab v-for="tab in tabs" :key="tab.label" :value="tab.label">
        <div class="flex gap-2">
          <div class="flex items-center gap-2 text-inherit">
            <i :class="tab.icon" />
            <span>{{ tab.title }}</span>
          </div>
          <Badge v-if="tab.badge?.value" :value="tab.badge.value" />
        </div>
      </Tab>
      <div class="flex items-center w-full justify-end mr-2">
        <Button
          label="Новая накладная"
          icon="pi pi-calendar-plus"
          severity="primary"
          variant="outlined"
          @click="createEditor()"
        />
      </div>
    </TabList>
    <TabPanels :pt="{ root: 'rounded-b-md' }">
      <TabPanel value="editor" :pt="{ root: 'flex flex-col gap-5' }">
        <IAEditor />
      </TabPanel>
      <TabPanel value="drafts">
        <InvoiceDrafts :drafts="Array.from(drafts.values())" @open="openDraft" />
      </TabPanel>
      <TabPanel value="history">
        <IAHistory @open="createEditor" />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>
