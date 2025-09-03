export const useTableStore = defineStore('table', () => {
  const clientStore = useClientStore()
  const { currentEmployee } = storeToRefs(clientStore)
  // const productItems = ref<ProductItem[]>([])

  const selectedProductItemId = ref<ProductItem['id'] | null>(null)
  const selectedCollectionId = ref<number | null>(0)
  const selectedStockId = ref<Stock['id'] | null>(currentEmployee.value?.stock_id ?? null)
  const selectedFilterOption = ref<FilterOption>('Все')
  const selectedTablePanel = ref<string | null>(null)

  const hasScrollToSelectedProduct = ref(true)

  const productTableItems = ref<ProductTableItem[]>([])
  const productTableShipments = ref<ProductTableShipment[]>([])

  watchEffect((onCleanup) => {
    const productTableItemsCursor = ProductTableItems.find({
      collection_id: selectedCollectionId.value,
    })
    productTableItems.value = productTableItemsCursor.fetch() ?? []

    onCleanup(() => {
      productTableItemsCursor.cleanup()
    })
  })

  watchEffect((onCleanup) => {
    if (selectedStockId.value !== null) {
      const productTableShipmentsCursor = ProductTableShipments.find({
        stock_id: selectedStockId.value,
      })
      productTableShipments.value = productTableShipmentsCursor.fetch() ?? []

      onCleanup(() => {
        productTableShipmentsCursor.cleanup()
      })
    }
  })
  // watchEffect((onCleanup) => {
  //   // SignalDB синхронизация
  //   const productItemsCursor = ProductItems.find(
  //     { collection_id: selectedCollectionId.value },
  //     { sort: { id: 1 } },
  //   )
  //   productItems.value = (productItemsCursor.fetch() as ProductItem[] | undefined) ?? []

  //   onCleanup(() => {
  //     productItemsCursor.cleanup()
  //   })
  // })

  // const userStockWatch = watchEffect(() => {
  //   if (selectedStockId.value === null) {
  //     const userStock = useOrganizationStore().getUserStock()
  //     if (userStock !== null) {
  //       selectedStockId.value = userStock.id
  //       userStockWatch()
  //     }
  //   } else {
  //     userStockWatch()
  //   }
  // })

  function setSelectedStockId(id: Stock['id']) {
    selectedStockId.value = id
    if (selectedFilterOption.value !== 'Все') {
      setSelectedProductItemId(null)
    }
  }

  function setSelectedFilterOption(filterOption: FilterOption) {
    selectedFilterOption.value = filterOption
  }

  function setSelectedProductItemId(id: ProductItem['id'] | null, scrollToSelectedProduct = true) {
    hasScrollToSelectedProduct.value = scrollToSelectedProduct
    selectedProductItemId.value = id
  }

  function setSelectedCollectionId(collectionId: number | null, hasSubmenu = false) {
    if (hasSubmenu === false && collectionId !== selectedCollectionId.value) {
      selectedCollectionId.value = collectionId
      setSelectedProductItemId(null)
    }
  }

  function setSelectedTablePanel(value: string | null) {
    selectedTablePanel.value = value
  }

  return {
    // productItems,
    productTableItems,
    productTableShipments,
    selectedProductItemId,
    selectedCollectionId,
    selectedStockId,
    selectedFilterOption,
    selectedTablePanel,
    hasScrollToSelectedProduct,
    setSelectedStockId,
    setSelectedFilterOption,
    setSelectedProductItemId,
    setSelectedCollectionId,
    setSelectedTablePanel,
  }
})
