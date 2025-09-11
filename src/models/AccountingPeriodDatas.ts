import { Collection } from '@signaldb/core'
import createIndexedDBAdapter from '@signaldb/indexeddb'
import vueReactivityAdapter from '@signaldb/vue'
import { useSignalDB } from '../composables/signaldb'

const AccountingPeriodDatas = new Collection<AccountingPeriodData>({
  name: 'supabase-accounting-period',
  reactivity: vueReactivityAdapter,
  persistence: createIndexedDBAdapter('supabase-accounting-period'),
})
AccountingPeriodDatas.on('persistence.error', (error) => {
  console.error('persistence.error', error)
})

const { syncManager } = useSignalDB()

syncManager.addCollection(AccountingPeriodDatas, { name: 'accounting_period_data' })
void syncManager.sync('accounting_period_data')

const { supabase } = useSupabase()
supabase
  .channel('public:accounting_period') // Specify the channel for your table
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'accounting_period' }, () => {
    void syncManager.sync('accounting_period_data')
  })
  .subscribe()

export default AccountingPeriodDatas
