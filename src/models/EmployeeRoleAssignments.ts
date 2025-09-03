import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const EmployeeRoleAssignments = new Collection<EmployeeRoleAssignment>({
  name: 'supabase-employee-role-assignment',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-employee-role-assignment'),
})
EmployeeRoleAssignments.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(EmployeeRoleAssignments, { name: 'employee_role_assignment' })
void syncManager.sync('employee_role_assignment')

export default EmployeeRoleAssignments
