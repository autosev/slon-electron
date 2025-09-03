<script setup lang="ts">
interface Option {
  name: string
  value: string | number | null
  nameClass?: string
}

withDefaults(
  defineProps<{
    options: Option[]
    border?: boolean
  }>(),
  { border: true },
)
</script>

<template>
  <div v-for="option in options" :key="option.name" class="property">
    <span class="float-right">{{ option.value }}</span>
    <span
      :class="{
        'relative block overflow-hidden text-ellipsis whitespace-nowrap after:content-empty after:absolute after:ml-[0.3em] after:bottom-[0.35em] after:w-full after:border-b after:border-dotted after:border-slate-400':
          border,
      }"
      >{{ option.name }}</span
    >
  </div>
</template>
