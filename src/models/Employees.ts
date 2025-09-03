import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const Employees = new Collection<Employee>({
  name: 'supabase-employee',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-employee'),
})
Employees.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(Employees, { name: 'employee' })
void syncManager.sync('employee')

export default Employees
