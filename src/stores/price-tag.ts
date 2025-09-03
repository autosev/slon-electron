interface PriceTagEditorItem {
  product_item_id: ProductItem['id']
  retail_price: ProductItem['retail_price']
}

export const usePriceTagStore = defineStore('price-tag-store', () => {
  const confirm = useConfirm()

  const items = ref<PriceTagEditorItem[]>([])

  function addItemToEditor(
    product_item_id: ProductItem['id'],
    retail_price: ProductItem['retail_price'],
  ) {
    items.value.push({ product_item_id, retail_price })
  }

  function removeItemFromEditor(index: number) {
    items.value.splice(index, 1)
  }

  function removeAllItemsFromEditor() {
    confirm.require({
      header: 'Подтверждение',
      message: 'Очистить таблицу редактора ценников?',
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: 'Нет',
        severity: 'secondary',
        outlined: true,
      },
      acceptProps: {
        label: 'Очистить',
        severity: 'danger',
        outlined: true,
      },
      accept: () => {
        items.value = []
      },
      reject: () => {},
    })
  }

  return {
    items,
    addItemToEditor,
    removeItemFromEditor,
    removeAllItemsFromEditor,
  }
})
