import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const EmployeePermissions = new Collection<EmployeePermission>({
  name: 'supabase-employee-permission',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-employee-permission'),
})
EmployeePermissions.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(EmployeePermissions, { name: 'employee_permission' })
void syncManager.sync('employee_permission')

export default EmployeePermissions
