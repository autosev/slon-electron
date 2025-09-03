<script setup lang="ts">
import { Panel as PrimevuePanel } from 'primevue'

const props = defineProps<{ description: string }>()
</script>

<template>
  <PrimevuePanel header="Тут пусто" class="w-80 m-auto">
    <p>{{ props.description }}</p>
  </PrimevuePanel>
</template>
