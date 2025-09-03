<script lang="ts" setup></script>

<template>
  <div class="flex flex-col gap-5 mx-5">
    <div>
      <h3 class="font-semibold">Анализ реализации</h3>
      <div class="flex flex-col gap-4 mt-3">
        <DatePicker
          v-model="dateRange"
          selectionMode="range"
          :manualInput="false"
          iconDisplay="input"
          showIcon
          showButtonBar
          fluid
        />
        <CollectionSelect />
        <StockSelect />
        <Button label="Сформировать" fluid />
      </div>
    </div>
  </div>
</template>
