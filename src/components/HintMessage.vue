<script lang="ts" setup>
const props = defineProps<{ content: string }>()
</script>

<template>
  <Message size="small" icon="pi pi-info-circle">
    <span class="font-semibold">Подсказка:</span>
    {{ props.content }}
  </Message>
</template>
