<script lang="ts" setup>
const periods = ref<AccountingPeriodData[]>([])

const dayjs = useDayjs()

const firstOpenPeriod = computed(() =>
  periods.value.findLast((period) => period.is_closed === false),
)

function formatDate(dateString: string) {
  return dayjs(dateString).format('MMMM YYYY')
}

watchEffect((onCleanup) => {
  const accountingPeriodDatasCursor = AccountingPeriodDatas.find(
    {},
    {
      sort: {
        closed_until_date: -1,
      },
    },
  )
  periods.value = accountingPeriodDatasCursor.fetch() ?? []

  onCleanup(() => {
    accountingPeriodDatasCursor.cleanup()
  })
})
</script>

<template>
  <div class="flex flex-col">
    <Fieldset legend="История">
      <DataTable
        :value="periods"
        size="small"
        scrollable
        scrollHeight="250px"
        :virtualScrollerOptions="{ itemSize: 33 }"
      >
        <Column class="!text-center">
          <template #body="{ data }">
            <i v-if="data.id === firstOpenPeriod?.id" class="pi pi-asterisk !text-xs"></i>
          </template>
        </Column>
        <Column field="closed_until_date" header="Период" class="capitalize">
          <template #body="{ data }">
            {{ formatDate(data.closed_until_date) }}
          </template>
        </Column>
        <Column field="is_closed" header="Статус">
          <template #body="{ data }">
            {{ data.is_closed ? 'Закрыт' : 'Открыт' }}
          </template>
        </Column>
        <Column field="closed_at" header="Дата закрытия">
          <template #body="{ data }">
            {{ data.closed_at ? data.closed_at : '-' }}
          </template>
        </Column>
        <Column field="closed_by" style="width: 32px">
          <template #body="{ data }">
            <EmployeeAvatar v-if="data.closed_by" :id="data.closed_by" :size="16" />
          </template>
        </Column>
      </DataTable>
    </Fieldset>

    <Fieldset v-if="firstOpenPeriod" legend="Операция">
      <Message size="small" severity="warn" icon="pi pi-exclamation-triangle">
        После закрытия периода все операции до
        {{ dayjs(firstOpenPeriod.closed_until_date).format('L') }} (включительно) будут
        заблокированы для редактирования.
      </Message>
      <div class="flex gap-4 mt-5">
        <div class="w-1/2">
          <FloatLabel variant="on">
            <InputText
              :model-value="formatDate(firstOpenPeriod.closed_until_date)"
              class="capitalize"
              disabled
              fluid
            />
            <label for="on_label">Период</label>
          </FloatLabel>
        </div>
        <div class="w-1/2">
          <Button label="Закрыть" icon="pi pi-lock" fluid />
        </div>
      </div>
    </Fieldset>
  </div>
</template>
