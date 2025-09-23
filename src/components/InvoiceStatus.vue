<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    status: InvoiceEditorStatus | InvoiceArrival['status'] | InvoiceExpenditure['status']
    created_at: string
    created_by?: Employee['id']
    simple?: boolean
  }>(),
  { simple: false },
)
const dayjs = useDayjs()
const { getEmployeeFullName } = useTools()

const statusInfo = computed(() => {
  switch (props.status) {
    case 'draft':
      return {
        tag: {
          value: 'Черновик',
          severity: 'secondary',
        },
        dateText: 'Последнее сохранение',
      }
    case 'completed':
      return {
        tag: { value: 'Проведена', severity: 'success' },
      }
    case 'prior':
      return {
        tag: { value: 'На рассмотрении', severity: 'warn' },
      }
    case 'rejected':
      return {
        tag: { value: 'Отклонена', severity: 'danger' },
      }
    case 'reversed':
      return {
        tag: { value: 'Аннулирована', severity: 'danger' },
      }
    default:
      break
  }
})
</script>

<template>
  <div class="flex gap-3 items-center justify-between">
    <div class="flex gap-3 items-center">
      <!-- <i class="pi pi-lock" v-tooltip.bottom="{ value: 'В закрытом периоде' }"></i> -->
      <template v-if="statusInfo !== undefined">
        <Tag
          v-if="props.simple === false"
          :value="statusInfo.tag.value"
          :severity="statusInfo.tag.severity"
          size="small"
          class="!rounded-full !px-3"
        ></Tag>
        <div v-else>
          <span class="font-semibold">[{{ statusInfo.tag.value }}]</span>
        </div>
      </template>
      <div>
        <slot />
      </div>
    </div>
    <div v-if="statusInfo !== undefined" class="flex gap-3 items-center">
      <span class="mt-1 flex gap-3 text-xs text-end text-muted-color">
        {{ statusInfo.dateText ?? 'Опубликована' }}:<br />
        {{ dayjs(props.created_at).format('L LTS') }}
      </span>
      <EmployeeAvatar
        v-if="props.created_by !== undefined"
        :id="props.created_by"
        :size="16"
        v-tooltip.bottom="{ value: getEmployeeFullName(props.created_by) }"
      />
    </div>
  </div>
</template>
