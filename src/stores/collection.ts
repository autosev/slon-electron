export const useCollectionStore = defineStore('collection', () => {
  const collectionOptions = ref<CollectionMenuItem[]>([])

  watchEffect((onCleanup) => {
    const collectionsCursor = Collections.find()
    const collectionsData = collectionsCursor.fetch() as CollectionItem[]

    collectionOptions.value = buildCollectionTree(collectionsData)

    onCleanup(() => {
      collectionsCursor.cleanup()
    })
  })

  function getCollectionOption(id: number) {
    const col = Collections.findOne({ id }, { reactive: false }) as CollectionItem
    return {
      key: String(col.id),
      id: col.id,
      label: col.name,
      items: [],
      product_type_id: col.product_type_id,
      parent_id: col.parent_id,
      sort_order: col.sort_order,
      has_submenu: col.has_submenu,
    } as CollectionMenuItem
  }

  function buildCollectionTree(collections: CollectionItem[], parentId: number | null = null) {
    const items: CollectionMenuItem[] = collections
      .filter((col) => col.parent_id === parentId)
      .map((col) => ({
        key: String(col.id),
        id: col.id,
        label: col.name,
        items: buildCollectionTree(collections, col.id), // Рекурсивный вызов
        product_type_id: col.product_type_id,
        parent_id: col.parent_id,
        sort_order: col.sort_order,
        has_submenu: col.has_submenu,
      }))

    // Сортировка элементов по `sort_order`
    return items.sort((a, b) => a.sort_order - b.sort_order)
  }

  return { collectionOptions, getCollectionOption }
})
