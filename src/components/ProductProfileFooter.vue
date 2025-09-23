<script setup lang="ts">
const injected = inject<{
  mode: 'edit' | 'create'
  productItem: Ref<ProductItem>
  isProductChanged: () => boolean
  isProductReady: () => boolean
  moveToArchive: () => boolean
  createProduct: () => void
  updateProduct: () => void
  closeDialog: () => void
}>('productProfile')
if (!injected) {
  throw new Error('ProductProfile not provided')
}

const {
  mode,
  productItem,
  isProductChanged,
  isProductReady,
  moveToArchive,
  createProduct,
  updateProduct,
  closeDialog,
} = injected

const { hasCurrentUserPermission } = useClientStore()

const isUpdateDisabled = computed(() => isProductChanged() === false)
const isCreateDisabled = computed(() => isProductReady() === false)

function submit() {
  if (mode === 'edit') {
    updateProduct()
  } else if (mode === 'create') {
    createProduct()
  }
  closeDialog()
}

function submitArchive() {
  if (moveToArchive() === true) {
    closeDialog()
  }
}
</script>

<template>
  <div class="w-full flex justify-between pt-4">
    <div>
      <Button
        v-if="
          mode === 'edit' &&
          productItem.collection_id !== null &&
          hasCurrentUserPermission('product.archive')
        "
        type="button"
        label="В архив"
        icon="pi pi-inbox"
        variant="outlined"
        @click="submitArchive"
      ></Button>
      <Message
        v-else-if="productItem.collection_id === null"
        severity="warn"
        icon="pi pi-exclamation-triangle"
      >
        Товар находится в архиве
      </Message>
    </div>
    <div class="flex gap-3">
      <Button
        v-if="mode === 'edit'"
        type="button"
        label="Обновить"
        :disabled="isUpdateDisabled"
        @click="submit"
      ></Button>
      <Button
        v-else-if="mode === 'create'"
        type="button"
        label="Создать"
        :disabled="isCreateDisabled"
        @click="submit"
      ></Button>
    </div>
  </div>
</template>
