<script lang="ts" setup>
import VendorCreate from './VendorCreate.vue'

const props = withDefaults(defineProps<{ id: Vendor['id'] | null; disabled?: boolean }>(), {
  disabled: false,
})
const emit = defineEmits(['update:id'])

const dialog = useDialog()
const vendorOptions = ref<Vendor[]>([])

watchEffect((onCleanup) => {
  const vendorsCursor = Vendors.find()
  vendorOptions.value = vendorsCursor.fetch() as Vendor[]

  onCleanup(() => {
    vendorsCursor.cleanup()
  })
})

function openCreateDialog() {
  const dialogRef = dialog.open(
    h(VendorCreate, {
      onSubmited: () => {
        dialogRef.close()
      },
    }),
    {
      props: {
        modal: true,
        header: 'Новый контрагент',
        style: { width: '300px' },
        draggable: false,
      },
    },
  )
}
</script>

<template>
  <FloatLabel class="w-full md:w-auto" variant="on">
    <Select
      :model-value="props.id"
      :options="vendorOptions"
      option-value="id"
      option-label="name"
      :disabled="props.disabled"
      class="w-full"
      @update:model-value="(value) => emit('update:id', value)"
      labelId="on_vendor"
      filter
    >
      <template #footer>
        <div class="p-3">
          <Button
            label="Добавить нового"
            severity="secondary"
            size="small"
            icon="pi pi-plus"
            @click="openCreateDialog"
            fluid
            text
          />
        </div>
      </template>
    </Select>
    <label for="on_vendor">Контрагент</label>
  </FloatLabel>
</template>
