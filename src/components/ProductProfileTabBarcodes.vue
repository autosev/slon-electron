<script lang="ts" setup>
import ProductBarcodeCreate from './ProductBarcodeCreate.vue'

const injected = inject<{
  productBarcodes: Ref<(ProductBarcode | ProductBarcodeInsert)[]>
  createProductBarcode: (barcode: ProductBarcodeInsert) => boolean
  removeProductBarcode: (index: number) => void
}>('productProfile')
if (!injected) {
  throw new Error('productProfile not provided')
}
const { productBarcodes, createProductBarcode, removeProductBarcode } = injected

const dialog = useDialog()

function getBarcodeType(type: ProductBarcode['type']) {
  return type === 'factory' ? 'Заводской' : 'Внутренний'
}

function openCreateBarcodeDialog() {
  const dialogRef = dialog.open(
    h(ProductBarcodeCreate, {
      onSubmit: (barcode) => {
        if (createProductBarcode(barcode) === true) {
          dialogRef.close()
        }
      },
    }),
    {
      props: {
        modal: true,
        header: 'Новый штрих-код',
        style: { width: '300px' },
        draggable: false,
      },
    },
  )
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <Fieldset v-if="productBarcodes.length > 0" legend="Таблица" class="w-full">
      <DataTable :value="productBarcodes" size="small">
        <Column field="code" header="Код"></Column>
        <Column field="type" header="Тип">
          <template #body="{ data }">
            {{ getBarcodeType(data.type) }}
          </template>
        </Column>
        <Column class="!w-16">
          <template #body="{ index }">
            <Button
              severity="danger"
              size="small"
              variant="outlined"
              icon="pi pi-trash"
              rounded
              @click="removeProductBarcode(index)"
            />
          </template>
        </Column>
      </DataTable>
    </Fieldset>
    <Button
      label="Создать штрих-код"
      variant="outlined"
      icon="pi pi-plus"
      @click="openCreateBarcodeDialog"
      fluid
    />
  </div>
</template>
