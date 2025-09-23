<script setup lang="ts">
import Avatar from 'vue-boring-avatars'

const props = defineProps<{ id: string; size: number }>()
</script>

<template>
  <div class="cursor-pointer border rounded-full border-surface">
    <Avatar
      :name="props.id"
      :size="props.size"
      :colors="[
        'var(--p-primary-800)',
        'var(--p-primary-600)',
        'var(--p-primary-300)',
        'var(--p-primary-400)',
        'var(--p-primary-900)',
      ]"
      variant="beam"
    />
  </div>
</template>
