import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const EmployeeDatas = new Collection<EmployeeData>({
  name: 'supabase-employee-data',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-employee-data'),
})
EmployeeDatas.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(EmployeeDatas, { name: 'employee_data' })
void syncManager.sync('employee_data')

export default EmployeeDatas
