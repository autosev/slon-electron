<script setup lang="ts">
import Avatar from 'vue-boring-avatars'

const props = defineProps<{ id: string; size: number }>()
</script>

<template>
  <div class="cursor-pointer">
    <Avatar
      :name="props.id"
      :size="props.size"
      :colors="['#1f1f20', '#2b4c7e', '#567ebb', '#606d80', '#dce0e6']"
      variant="beam"
    />
  </div>
</template>
