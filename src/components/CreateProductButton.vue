<script lang="ts" setup>
const visible = ref(false)

const tableStore = useTableStore()
const { setSelectedProductItemId, setSelectedCollectionId } = tableStore

function onCreated(productItemId: ProductItem['id'], collectionId: CollectionItem['id']) {
  setSelectedCollectionId(collectionId)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setSelectedProductItemId(productItemId, true)
    })
  })
}
</script>

<template>
  <Button
    label="Новый товар"
    icon="pi pi-file-plus"
    severity="primary"
    variant="outlined"
    @click="visible = true"
  />
  <ProductProfileDialog v-model:visible="visible" mode="create" @created="onCreated" />
</template>
