<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    parentId: number
    productTypeId: number
    name?: string
    hasSubmenu?: boolean
    updateId?: number
    updateOnly?: boolean
    sortOrder?: number
  }>(),
  {
    name: '',
    sortOrder: 1,
    updateOnly: false,
    hasSubmenu: undefined,
    updateId: undefined,
  },
)
const emit = defineEmits(['submited'])

interface TypeItem {
  name: string
  code: string
  icon: string
}
const types: TypeItem[] = [
  { name: 'Группа', code: 'group', icon: 'pi pi-folder text-emerald-400' },
  { name: 'Коллекция', code: 'collection', icon: 'pi pi-folder text-amber-400' },
]
const selectedType = ref(
  props.hasSubmenu === true ? types[0] : props.hasSubmenu === false ? types[1] : null,
)

const name = ref(props.name)
const selectedCollectionParentId = ref(props.parentId)
const selectedProductTypeId = ref(props.productTypeId)
const sortOrder = ref(props.sortOrder)

const isUpdateDisabled = computed(
  () =>
    props.name === name.value &&
    props.parentId === selectedCollectionParentId.value &&
    props.productTypeId === selectedProductTypeId.value &&
    props.sortOrder === sortOrder.value,
)

function createCollection() {
  if (selectedType.value && name.value) {
    try {
      const parent_id =
        selectedCollectionParentId.value > 0 ? selectedCollectionParentId.value : null
      const has_submenu = selectedType.value.code === 'group' ? true : false
      Collections.insert({
        name: name.value,
        parent_id,
        product_type_id: selectedProductTypeId.value,
        has_submenu,
        sort_order: sortOrder.value,
      })
      emit('submited')
    } catch (e) {
      console.log(e)
    }
  }
}

function updateCollection() {
  if (props.updateId !== undefined) {
    try {
      const parent_id =
        selectedCollectionParentId.value > 0 ? selectedCollectionParentId.value : null
      Collections.updateOne(
        { id: props.updateId },
        {
          $set: {
            name: name.value,
            parent_id,
            product_type_id: selectedProductTypeId.value,
            sort_order: sortOrder.value,
          },
        },
      )
      emit('submited')
    } catch (e) {
      console.log(e)
    }
  }
}
</script>

<template>
  <div class="py-3">
    <div class="flex gap-4">
      <FloatLabel class="w-48" variant="on">
        <Select
          v-model="selectedType"
          :options="types"
          optionLabel="name"
          class="w-48"
          inputId="on_label"
          :disabled="props.updateOnly"
        >
          <template #value="slotProps">
            <span v-if="slotProps.value">
              <i :class="slotProps.value.icon" class="mr-2"></i>
              {{ slotProps.value.name }}
            </span>
          </template>
          <template #option="slotProps">
            <i :class="slotProps.option.icon" class="mr-2"></i>
            {{ slotProps.option.name }}
          </template>
        </Select>
        <label for="on_label">Тип</label>
      </FloatLabel>
      <FloatLabel class="w-full" variant="on">
        <InputText type="text" class="w-full" v-model="name" />
        <label for="on_label">Название</label>
      </FloatLabel>
    </div>
    <div class="my-6 flex flex-col gap-6">
      <div class="flex flex-row gap-4">
        <FloatLabel class="w-full" variant="on">
          <CollectionSelect
            v-model:id="selectedCollectionParentId"
            inputId="on_label"
            groupOnly
            rootItem
          />
          <label for="on_label">Расположение</label>
        </FloatLabel>
        <FloatLabel class="w-36" variant="on">
          <InputNumber
            v-model="sortOrder"
            inputId="minmax"
            :min="1"
            :max="1000"
            fluid
            showButtons
          />
          <label for="on_label">Номер</label>
        </FloatLabel>
      </div>
      <ProductTypeSelect v-model:id="selectedProductTypeId" />
    </div>
  </div>
  <Button
    v-if="props.updateOnly === false"
    label="Готово"
    :disabled="!(selectedType && name && productTypeId)"
    @click="createCollection"
    fluid
  />
  <Button v-else label="Обновить" :disabled="isUpdateDisabled" @click="updateCollection" fluid />
</template>
