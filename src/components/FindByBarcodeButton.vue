<script setup lang="ts">
const visible = ref(false)

const tableStore = useTableStore()
const { setSelectedProductItemId, setSelectedCollectionId, setSelectedFilterOption } = tableStore
const { selectedFilterOption } = storeToRefs(tableStore)

const barcode = ref('')
const invalidBarcode = ref('')

const isInvalid = computed(
  () => invalidBarcode.value !== '' && invalidBarcode.value === barcode.value,
)

function findByBarcode() {
  setSelectedProductItemId(null)
  setSelectedFilterOption('Все')
  nextTick(() => {
    const productBarcode = ProductBarcodes.findOne({ code: barcode.value }, { reactive: false }) as
      | ProductShipment
      | undefined

    if (productBarcode === undefined) {
      // Штрих-код не найден
      invalidBarcode.value = barcode.value
    } else {
      const productItem = ProductItems.findOne(
        { id: productBarcode.product_item_id },
        { reactive: false },
      ) as ProductItem | undefined

      if (productItem !== undefined) {
        setSelectedCollectionId(productItem.collection_id)
        requestAnimationFrame(() => {
          // Ждем еще один кадр, для гарантии что перерисовка завершилась
          requestAnimationFrame(() => {
            setSelectedProductItemId(productItem.id)
            visible.value = false
          })
        })
      }
    }
  })
}
</script>

<template>
  <Button
    label="Найти по штрих-коду"
    icon="pi pi-barcode"
    severity="primary"
    variant="outlined"
    @click="visible = true"
  />
  <Dialog
    v-model:visible="visible"
    modal
    header="Поиск по штрих-коду"
    :style="{ width: '25rem' }"
    :draggable="false"
    @after-hide="barcode = ''"
  >
    <div class="mb-4">
      <IconField>
        <InputIcon>
          <i class="pi pi-barcode" />
        </InputIcon>
        <InputText
          v-model="barcode"
          placeholder="Штрих-код"
          autocomplete="off"
          :invalid="isInvalid"
          :pt="{ root: 'w-full' }"
          autofocus
          @keyup.enter="findByBarcode"
        />
      </IconField>
      <Message
        v-if="selectedFilterOption !== 'Все'"
        size="small"
        severity="info"
        variant="simple"
        class="mt-2"
      >
        Для поиска по штрих-коду фильтр "{{ selectedFilterOption }}" будет переключен на "Все".
      </Message>
      <Message v-if="isInvalid" size="small" severity="error" variant="simple" class="mt-2">
        Товар с таким штрих-кодом не найден.
      </Message>
    </div>
    <div class="flex justify-end gap-3">
      <Button type="button" label="Закрыть" severity="secondary" @click="visible = false"></Button>
      <Button
        type="button"
        label="Найти"
        @click="findByBarcode"
        :disabled="barcode === '' || isInvalid"
      ></Button>
    </div>
  </Dialog>
</template>
