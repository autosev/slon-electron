<script setup lang="ts">
const tabs = ref([
  { label: 'index', title: 'Основное', icon: 'pi pi-home' },
  { label: 'packages', title: 'Упаковки и цены', icon: 'pi pi-box' },
  { label: 'barcodes', title: 'Штрих-коды', icon: 'pi pi-barcode' },
  { label: 'characteristics', title: 'Характеристики', icon: 'pi pi-list' },
  { label: 'website', title: 'Сайт', icon: 'pi pi-globe' },
])
</script>

<template>
  <div class="card">
    <Tabs
      value="index"
      class="justify-between"
      :pt="{ root: 'border border-surface rounded-border' }"
    >
      <TabList :pt="{ tablist: 'rounded-t-md' }">
        <Tab v-for="tab in tabs" :key="tab.label" :value="tab.label">
          <span class="flex items-center gap-2 text-inherit">
            <i :class="tab.icon" />
            <span>{{ tab.title }}</span>
          </span>
        </Tab>
      </TabList>
      <TabPanels :pt="{ root: 'rounded-b-md' }">
        <TabPanel value="index">
          <ProductProfileTabMain />
        </TabPanel>
        <TabPanel value="packages">
          <ProductProfileTabPackages />
        </TabPanel>
        <TabPanel value="barcodes">
          <ProductProfileTabBarcodes />
        </TabPanel>
        <TabPanel value="characteristics">
          <ProductProfileTabCharacteristics />
        </TabPanel>
        <TabPanel value="website">
          <ProductProfileTabWebsite />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
