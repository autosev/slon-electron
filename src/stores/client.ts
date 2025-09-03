export const useClientStore = defineStore('client', () => {
  const currentUser = ref<User | null>(useAuth().getUser())

  const currentEmployee = computed<Employee | null>(() => {
    const user = useAuth().getUser()
    return (Employees.findOne({ id: user?.id }) as Employee | undefined) ?? null
  })

  const isClientOnline = ref(true)
  const isServerOnline = ref(true)
  const lastSyncDate = ref<Date | null>(getSyncDate())
  const isSyncing = ref(false)

  const isOnline = computed(() => isClientOnline.value === true && isServerOnline.value === true)

  function updateClientOnlineStatus() {
    isClientOnline.value = navigator.onLine
  }

  function setServerOnlineStatus(status: boolean) {
    isServerOnline.value = status
  }

  function getSyncDate() {
    const syncTimestamp = localStorage.getItem('last-sync-timestamp')
    return syncTimestamp !== null ? new Date(Number(syncTimestamp)) : null
  }

  function startSync() {
    isSyncing.value = true
  }

  function endSync(status: boolean) {
    isSyncing.value = false
    if (status === true) {
      lastSyncDate.value = new Date()
      localStorage.setItem('last-sync-timestamp', lastSyncDate.value.getTime().toString())
    }
  }

  function getClientVersion() {
    return localStorage.getItem('client-version')
  }

  function setClientVersion(newVersion: string) {
    localStorage.setItem('client-version', newVersion)
  }

  function setCurrentUser(value: User | null) {
    if (typeof value === 'object' && value?.id) {
      currentUser.value = { ...value }
    } else {
      currentUser.value = null
    }
  }

  function hasCurrentUserPermission(name: string) {
    if (currentUser.value !== null) {
      const currentEmployeeData = EmployeeDatas.findOne(
        { id: currentEmployee.value?.id },
        { reactive: false },
      )

      if (currentEmployeeData !== undefined) {
        const { roles } = currentEmployeeData
        const employeePermission = EmployeePermissions.findOne({ name }, { reactive: false })

        if (employeePermission !== undefined) {
          const rolePermission = EmployeeRolePermissions.findOne(
            { employee_role_id: { $in: roles }, employee_permission_id: employeePermission.id },
            { reactive: false },
          )
          return rolePermission !== undefined
        }
      }
    }
    return false
  }

  return {
    currentUser,
    currentEmployee,
    isClientOnline,
    isServerOnline,
    lastSyncDate,
    isSyncing,
    isOnline,
    updateClientOnlineStatus,
    setServerOnlineStatus,
    startSync,
    endSync,
    getClientVersion,
    setClientVersion,
    setCurrentUser,
    hasCurrentUserPermission,
  }
})
