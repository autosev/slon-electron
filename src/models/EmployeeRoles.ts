import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const EmployeeRoles = new Collection<EmployeeRole>({
  name: 'supabase-employee-role',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-employee-role'),
})
EmployeeRoles.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(EmployeeRoles, { name: 'employee_role' })
void syncManager.sync('employee_role')

export default EmployeeRoles
