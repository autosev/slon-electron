<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    id: InvoiceDocument['id']
    slug: InvoiceDocument['slug']
    parent_id: InvoiceDocument['parent_id']
    copyToClipboard?: boolean
  }>(),
  {
    copyToClipboard: true,
  },
)
const emit = defineEmits<{ (e: 'open', id: InvoiceDocument['id']): void }>()

const toast = useToast()

const invoiceDocumentChild = computed(
  () => (InvoiceDocuments.findOne({ parent_id: props.id }) as InvoiceDocument | undefined) ?? null,
)

const firstButtonLabel = computed(() => {
  if (props.parent_id === null) {
    return props.slug
  } else {
    return (
      (
        InvoiceDocuments.findOne({ id: props.parent_id }, { reactive: false }) as
          | InvoiceDocument
          | undefined
      )?.slug ?? 'Неизвестно'
    )
  }
})

const lastButtonLabel = computed(() => invoiceDocumentChild.value?.slug ?? props.slug)

function onClick(slug: InvoiceDocument['slug']) {
  if (slug === props.slug) {
    if (props.copyToClipboard === true) {
      navigator.clipboard.writeText(slug).then(() => {
        toast.add({
          severity: 'success',
          summary: 'Успешно скопирован',
          detail: `Номер ${slug} успешно скопирован.`,
          life: 3000,
        })
      })
    }
  } else if (invoiceDocumentChild.value !== null && slug === invoiceDocumentChild.value.slug) {
    emit('open', invoiceDocumentChild.value.id)
  } else if (props.parent_id !== null) {
    emit('open', props.parent_id)
  }
}
</script>

<template>
  <div class="flex gap-3 items-center">
    <Button
      :label="firstButtonLabel"
      :severity="firstButtonLabel === props.slug ? 'contrast' : 'secondary'"
      variant="outlined"
      icon="pi pi-hashtag"
      class="text-nowrap"
      size="small"
      rounded
      @click="onClick(firstButtonLabel)"
    />
    <template v-if="invoiceDocumentChild !== null || props.parent_id !== null">
      <div>
        <i class="pi pi-link"></i>
      </div>
      <Button
        :label="lastButtonLabel"
        :severity="lastButtonLabel === props.slug ? 'contrast' : 'secondary'"
        variant="outlined"
        icon="pi pi-hashtag"
        class="text-nowrap"
        size="small"
        rounded
        @click="onClick(lastButtonLabel)"
      />
    </template>
  </div>
</template>
