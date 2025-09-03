<script lang="ts" setup>
// const props = defineProps<{
//   selectedPanel: string | null
// }>()
const emit = defineEmits(['update:selectedPanel'])

const { items } = storeToRefs(usePriceTagStore())

const otherMenu = ref()
const otherMenuItems = ref([
  {
    label: 'Инструменты',
    items: [
      // {
      //   label: 'Помощник продавца',
      //   icon: 'pi pi-cart-arrow-down',
      //   command: () => emit('update:selectedPanel', 'seller-helper'),
      // },
      {
        label: 'Редактор ценников',
        icon: 'pi pi-tags',
        command: () => emit('update:selectedPanel', 'product-price-tag-editor'),
        badge: computed(() => items.value.length),
      },
    ],
  },
  // {
  //   label: 'Аналитика',
  //   items: [
  //     {
  //       label: 'Интерфейс продавца',
  //       icon: 'pi pi-cart-arrow-down',
  //       command: () => emit('update:selectedPanel', 'CashRegister'),
  //     },
  //     {
  //       label: 'Редактор ценников',
  //       icon: 'pi pi-tags',
  //       command: () => emit('update:selectedPanel', 'product-price-tag-editor'),
  //       badge: computed(() => items.value.length),
  //     },
  //   ],
  // },
])
const isBageVisible = computed(() => items.value.length > 0)

const toggle = (event: MouseEvent) => {
  otherMenu.value.toggle(event)
}
</script>

<template>
  <OverlayBadge v-if="isBageVisible === true">
    <Button
      label="Другое"
      icon="pi pi-ellipsis-v"
      severity="primary"
      variant="outlined"
      @click="toggle"
      aria-haspopup="true"
      aria-controls="overlay_menu"
    />
  </OverlayBadge>
  <Button
    v-else
    label="Другое"
    icon="pi pi-ellipsis-v"
    severity="primary"
    variant="outlined"
    @click="toggle"
    aria-haspopup="true"
    aria-controls="overlay_menu"
  />
  <Menu ref="otherMenu" :model="otherMenuItems" :popup="true">
    <template #item="{ item, props }">
      <a v-ripple class="flex items-center" v-bind="props.action">
        <i :class="item.icon" />
        <span>{{ item.label }}</span>
        <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
      </a>
    </template>
  </Menu>
</template>
