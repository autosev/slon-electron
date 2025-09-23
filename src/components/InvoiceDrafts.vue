<script lang="ts" setup>
const props = defineProps<{
  drafts: InvoiceArrivalDocumentEditor[] | InvoiceExpenditureDocumentEditor[]
}>()
const emit = defineEmits<{
  (e: 'open', id: InvoiceArrivalDocumentEditor['id'] | InvoiceExpenditureDocumentEditor['id']): void
}>()

const dayjs = useDayjs()

const soredDrafts = computed(() =>
  props.drafts.sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf()),
)
</script>

<template>
  <Message size="small" icon="pi pi-question-circle" :class="{ 'mb-3': soredDrafts.length > 0 }">
    Черновики — твои сохраненные накладные, которые доступны всем только на этом компьютере. К их
    редактированию можно вернуться в любой момент. Не забудь удалить ненужные.
  </Message>
  <div class="@container">
    <div class="grid grid-cols-1 @[1000px]:grid-cols-2 @[1470px]:grid-cols-3 gap-3">
      <InvoiceCard
        v-for="draft in soredDrafts"
        :key="draft.id"
        :data="draft"
        @click="emit('open', draft.id)"
      />
    </div>
    <!-- <div v-else class="mt-5">
      <EmptyCard description="Сохраненные накладные на этом компьютере не найдены." />
    </div> -->
  </div>
</template>
