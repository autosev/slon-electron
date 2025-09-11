<script setup lang="ts">
import { MenuItem } from 'primevue/menuitem'
import { useDialog } from 'primevue/usedialog'
import CollectionCreate from './CollectionCreate.vue'

const props = defineProps<{ class: string }>()
const expandedKeys = ref({})

const dialog = useDialog()

const tableStore = useTableStore()
const { setSelectedCollectionId } = tableStore
const { selectedCollectionId } = storeToRefs(tableStore)

const collectionStore = useCollectionStore()
const { collectionOptions } = storeToRefs(collectionStore)

const contextMenu = ref()
const contextMenuItems = ref<MenuItem[]>([])

function openCreateDialog(parentId: number, productTypeId: number) {
  const dialogRef = dialog.open(
    h(CollectionCreate, {
      parentId,
      productTypeId,
      onSubmited: () => {
        dialogRef.close()
      },
    }),
    {
      props: {
        modal: true,
        header: 'Создать',
        style: { width: '400px' },
        draggable: false,
      },
    },
  )
}

function openEditDialog(
  updateId: number,
  parentId: number,
  productTypeId: number,
  name: string,
  hasSubmenu: boolean,
  sortOrder: number,
) {
  const dialogRef = dialog.open(
    h(CollectionCreate, {
      updateId,
      parentId,
      productTypeId,
      name,
      hasSubmenu,
      sortOrder,
      updateOnly: true,
      onSubmited: () => {
        dialogRef.close()
      },
    }),
    {
      props: {
        modal: true,
        header: 'Изменить',
        style: { width: '400px' },
        draggable: false,
      },
    },
  )
}

function onRowContextMenu(event: any, item: MenuItem) {
  if (item.has_submenu === true) {
    contextMenuItems.value = [
      {
        label: 'Создать',
        icon: 'pi pi-fw pi-folder-plus',
        command: () => openCreateDialog(Number(item.key), item.product_type_id),
      },
      {
        label: 'Изменить',
        icon: 'pi pi-fw pi-pen-to-square',
        command: () =>
          openEditDialog(
            Number(item.key),
            Number(item.parent_id),
            item.product_type_id,
            String(item.label),
            item.has_submenu,
            item.sort_order,
          ),
      },
    ]
  } else {
    contextMenuItems.value = [
      {
        label: 'Изменить',
        icon: 'pi pi-fw pi-pen-to-square',
        command: () =>
          openEditDialog(
            Number(item.key),
            Number(item.parent_id),
            item.product_type_id,
            String(item.label),
            item.has_submenu,
            item.sort_order,
          ),
      },
    ]
  }
  contextMenu.value.show(event)
}
</script>

<template>
  <div class="pl-6 pr-3 h-[64px] flex justify-between items-center">
    <h2>Коллекции</h2>
    <div class="flex gap-1">
      <Button
        icon="pi pi-inbox"
        severity="secondary"
        variant="text"
        size="small"
        v-tooltip.bottom="{ value: 'Архив' }"
        :class="{
          '!bg-yellow-50 !text-amber-400 !border-amber-400': selectedCollectionId === null,
        }"
        @click="setSelectedCollectionId(null)"
        rounded
      />
      <Button
        icon="pi pi-folder-plus"
        severity="secondary"
        variant="text"
        size="small"
        v-tooltip.bottom="{ value: 'Создать' }"
        @click="openCreateDialog(0, 1)"
        rounded
      />
    </div>
  </div>
  <div class="card flex justify-center" :class="props.class">
    <ContextMenu ref="contextMenu" :model="contextMenuItems" />
    <PanelMenu
      v-model:expandedKeys="expandedKeys"
      :model="collectionOptions"
      class="w-full"
      :pt="{
        root: '!gap-0',
        rootlist: '!ml-6 border-l border-slate-200 !p-0',
        submenu: '!ml-4 border-l border-slate-200 !p-0',
        contentcontainer: '!transition-none	',
      }"
      multiple
    >
      <template #item="{ item, active, root }">
        <a
          v-ripple
          class="flex items-center px-4 py-2 cursor-pointer group select-none"
          :class="{
            'pl-6': root === true,
            'bg-yellow-50 border-l border-amber-400': Number(item.key) === selectedCollectionId,
            'border-l border-transparent hover:bg-slate-50':
              Number(item.key) !== selectedCollectionId,
          }"
          @click="setSelectedCollectionId(Number(item.key), item.has_submenu)"
          @contextmenu="onRowContextMenu($event, item)"
        >
          <span
            :class="[
              'pi text-primary ',
              active && item.has_submenu ? 'pi-folder-open' : 'pi-folder',
              item.has_submenu ? 'text-emerald-400' : 'text-amber-400',
            ]"
          />
          <span :class="['ml-2']">{{ item.label }}</span>
        </a>
      </template>
    </PanelMenu>
  </div>
</template>
