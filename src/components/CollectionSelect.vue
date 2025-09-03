<script setup lang="ts">
const props = withDefaults(
  defineProps<{ id: CollectionItem['id'] | null; groupOnly?: boolean; rootItem?: boolean }>(),
  {
    groupOnly: false,
    rootItem: false,
  },
)
const emit = defineEmits<{ (e: 'update:id', value: number): void }>()

const collectionStore = useCollectionStore()
const { collectionOptions } = storeToRefs(collectionStore)

const rootCollectionOption: CollectionMenuItem = {
  key: '0',
  id: 0,
  label: 'Корневой каталог',
  items: [],
  product_type_id: 0,
  parent_id: null,
  sort_order: 0,
  has_submenu: true,
}

const filteredCollectionOptions = computed(() => {
  const filteredOptions = filterMenu(collectionOptions.value)
  return props.rootItem === true ? [...filteredOptions, rootCollectionOption] : filteredOptions
})
const selectedCollection = ref<CollectionMenuItem | null>(
  findItemById(filteredCollectionOptions.value, props.id),
)

function filterMenu(items: CollectionMenuItem[]): CollectionMenuItem[] {
  return items
    .filter(
      (option) =>
        (props.groupOnly === false &&
          ((option.has_submenu === true && option.items.length > 0) ||
            option.has_submenu === false)) ||
        (props.groupOnly === true && option.has_submenu === true),
    )
    .map((option) => ({
      ...option,
      items: filterMenu(option.items || []),
    }))
}

function findItemById(
  items: CollectionMenuItem[],
  id: CollectionItem['id'] | null,
): CollectionMenuItem | null {
  if (props.id !== null) {
    if (props.id === 0 && props.groupOnly) {
      return rootCollectionOption
    }

    for (const item of items) {
      if (item.id === id) {
        return item
      }

      if (item.items && item.items.length > 0) {
        const found = findItemById(item.items, id)
        if (found) {
          return found
        }
      }
    }
  }

  return null
}

function selectGroup(option: CollectionMenuItem) {
  if (props.groupOnly === true && option.has_submenu === true && option.items.length > 0) {
    selectedCollection.value = option
    emit('update:id', option.id)
  }
}

function onChangeValue() {
  if (selectedCollection.value !== null) {
    emit('update:id', selectedCollection.value.id)
  }
}
</script>

<template>
  <IconField>
    <InputIcon>
      <i
        class="pi pi-folder"
        :class="selectedCollection?.has_submenu === true ? 'text-emerald-400' : 'text-amber-400'"
      ></i>
    </InputIcon>
    <CascadeSelect
      v-model="selectedCollection"
      :options="filteredCollectionOptions"
      optionLabel="label"
      optionGroupLabel="label"
      optionGroupChildren="items"
      placeholder="Расположение"
      class="w-full"
      :pt="{ label: 'ml-6' }"
      @change="onChangeValue"
    >
      <template #option="slotProps">
        <div class="flex items-center w-full" @click="selectGroup(slotProps.option)">
          <i
            class="pi pi-folder mr-2"
            :class="slotProps.option.has_submenu === true ? 'text-emerald-400' : 'text-amber-400'"
          ></i>
          <span>{{ slotProps.option.label }}</span>
        </div>
      </template>
    </CascadeSelect>
  </IconField>
</template>
