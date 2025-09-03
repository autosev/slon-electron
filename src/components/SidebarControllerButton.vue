<script lang="ts" setup>
const props = defineProps<{
  panel: SidebarItem
  selectedKey: SidebarItem['key'] | null
}>()
const emit = defineEmits(['update:selectedKey'])

function setPanel(key: SidebarItem['key'] | null) {
  if (props.selectedKey !== key) {
    emit('update:selectedKey', key)
  } else {
    emit('update:selectedKey', null)
  }
}
</script>

<template>
  <div
    v-if="props.panel.disabled !== true"
    class="flex w-14 h-14 cursor-pointer"
    :class="{
      'border-l-2 border-blue-500 text-slate-900 pr-0.5': selectedKey === props.panel.key,
      'text-slate-500 hover:text-slate-900': selectedKey !== props.panel.key,
    }"
    v-tooltip="{ value: props.panel.title, disabled: selectedKey === props.panel.key }"
    @click="setPanel(props.panel.key)"
  >
    <Badge
      v-if="props.panel.badge?.value"
      :value="props.panel.badge.value"
      size="small"
      class="absolute !bg-blue-500"
      :style="
        selectedKey !== props.panel.key
          ? 'transform: translate(0.5rem, 0.5rem)'
          : 'transform: translate(0.4rem, 0.5rem)'
      "
    />
    <i class="!text-3xl m-auto" :class="props.panel.iconClass" />
  </div>
</template>
