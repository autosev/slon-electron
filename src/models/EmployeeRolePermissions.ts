import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const EmployeeRolePermissions = new Collection<EmployeeRolePermission>({
  name: 'supabase-employee-role-permission',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-employee-role-permission'),
})
EmployeeRolePermissions.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(EmployeeRolePermissions, { name: 'employee_role_permission' })
void syncManager.sync('employee_role_permission')

export default EmployeeRolePermissions
