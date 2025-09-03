<script lang="ts" setup>
import { MenuItem } from 'primevue/menuitem'

const props = defineProps<{ selectedKey: SidebarItem['key'] | null; options: SidebarItem[] }>()
const emit = defineEmits(['update:selectedKey'])

const router = useRouter()
const { getEmployeeFullName } = useTools()

const clientStore = useClientStore()
const { currentUser } = storeToRefs(clientStore)

const topPositionOptions = computed(() => props.options.filter((p) => p.position === 'top'))
const bottomPositionOptions = computed(() => props.options.filter((p) => p.position === 'bottom'))

const userMenu = useTemplateRef('userMenu')
const userMenuItems = ref<MenuItem[]>([])

function openUserMenu(event: Event) {
  if (userMenuItems.value.length === 0) {
    userMenuItems.value = [
      {
        label: getEmployeeFullName(currentUser.value?.id),
        items: [
          {
            label: 'Переключить',
            icon: 'pi pi-users',
            command: () => router.push({ name: 'welcome' }),
          },
          {
            label: 'Добавить',
            icon: 'pi pi-user-plus',
            command: () => router.push({ name: 'login' }),
          },
        ],
      },
    ]
  }
  userMenu.value?.toggle(event)
}
</script>

<template>
  <div class="w-14 bg-slate-300 flex flex-col justify-between items-center">
    <div class="flex flex-col items-center">
      <SidebarControllerButton
        v-for="panel in topPositionOptions"
        :key="panel.key"
        :selectedKey="props.selectedKey"
        :panel="panel"
        @update:selectedKey="emit('update:selectedKey', $event)"
      />
    </div>
    <div class="flex flex-col items-center">
      <SidebarControllerButton
        v-for="panel in bottomPositionOptions"
        :key="panel.key"
        :selectedKey="props.selectedKey"
        :panel="panel"
        @update:selectedKey="emit('update:selectedKey', $event)"
      />
      <div v-if="currentUser !== null && typeof currentUser.session !== 'string'">
        <div
          class="flex w-14 h-14"
          @click="openUserMenu"
          v-tooltip="{
            value:
              currentUser?.session.user.user_metadata.first_name +
              ' ' +
              currentUser?.session?.user.user_metadata.last_name,
          }"
        >
          <EmployeeAvatar :id="currentUser.id" :size="32" class="m-auto" />
        </div>
        <Menu ref="userMenu" :model="userMenuItems" popup />
      </div>
    </div>
  </div>
</template>
