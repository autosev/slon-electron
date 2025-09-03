<script lang="ts" setup>
const selectedDate = ref(new Date())
const periods = ref([
  {
    id: 1,
    date: 'Июнь 2025',
    status: 'Закрыт',
    closed_at: '30.06.2025',
    closed_by: 'c0f98717-fb49-4b78-922f-95affdf7062d',
  },
  {
    id: 2,
    date: 'Июль 2025',
    status: 'Открыт',
    closed_at: '-',
    closed_by: null,
  },
  {
    id: 3,
    date: 'Август 2025',
    status: 'Открыт',
    closed_at: '-',
    closed_by: null,
  },
])

const firstOpenPeriod = computed(() => periods.value.find((period) => period.status === 'Открыт'))
</script>

<template>
  <div class="flex flex-col">
    <Fieldset legend="История">
      <DataTable :value="periods" size="small">
        <Column class="!text-center">
          <template #body="{ data }">
            <i v-if="data.id === firstOpenPeriod?.id" class="pi pi-asterisk !text-xs"></i>
          </template>
        </Column>
        <Column field="date" header="Период"></Column>
        <Column field="status" header="Статус"></Column>
        <Column field="closed_at" header="Дата закрытия"></Column>
        <Column field="closed_by" style="width: 32px">
          <template #body="{ data }">
            <EmployeeAvatar v-if="data.closed_by" :id="data.closed_by" :size="16" />
          </template>
        </Column>
      </DataTable>
    </Fieldset>

    <Fieldset legend="Операция">
      <Message size="small" severity="warn" icon="pi pi-exclamation-triangle">
        После закрытия периода все операции до 31.07.2025 (включительно) будут заблокированы для
        редактирования.
      </Message>
      <div v-if="firstOpenPeriod" class="flex gap-4 mt-5">
        <div class="w-1/2">
          <FloatLabel variant="on">
            <InputText :model-value="firstOpenPeriod.date" disabled fluid />
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
