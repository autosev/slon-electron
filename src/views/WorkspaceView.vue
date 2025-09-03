<script setup lang="ts">
import { RealtimePostgresUpdatePayload } from '@supabase/supabase-js'
// import { Panel as PrimevuePanel } from 'primevue'

const { supabase } = useSupabase()
const { endSession } = useAuth()
const router = useRouter()

const { addNotification } = useNotificationStore()
// const { setOrganizations } = useOrganizationStore()

const tableStore = useTableStore()
// const { setSelectedProduct, setProductData } = productTableStore
// const { products } = storeToRefs(tableStore)

const { currentUser } = storeToRefs(useClientStore())
watch(currentUser, (newValue: User | null) => {
  if (newValue === null) {
    router.push({ name: 'welcome' })
  }
})

const { toCurrencyPrice } = useTools()

// onMounted(() => {
//   if (user === null) {
//     router.push({ name: 'welcome' })
//   }
// })

// onMounted(() => {
//   const { getUserStock } = useOrganizationStore()
//   supabase
//     .channel('notification')
//     .on(
//       'postgres_changes',
//       { event: 'UPDATE', schema: 'public', table: 'product_item' },
//       (payload: RealtimePostgresUpdatePayload<ProductItem>) => {
//         if (payload.new.retail_price !== payload.old.retail_price) {
//           const productItem = ProductItems.findOne({ id: payload.new.id }, { reactive: false }) as
//             | ProductItem
//             | undefined
//           if (productItem !== undefined) {
//             //
//             const userStock = getUserStock()
//             if (userStock !== null) {
//               const productShipmentInStock = ProductShipments.findOne(
//                 { product_item_id: productItem.id, stock_id: userStock.id, quantity: { $gt: 0 } },
//                 { reactive: false },
//               ) as ProductShipment | undefined

//               if (productShipmentInStock !== undefined) {
//                 const productBrand = ProductBrands.findOne(
//                   { id: payload.new.product_brand_id },
//                   { reactive: false },
//                 ) as ProductBrand | undefined

//                 if (productBrand !== undefined) {
//                   addNotification({
//                     type: 'retail_price_update',
//                     title: 'Изменение розничной цены',
//                     body: `Цена товара ${productBrand.name} ${payload.new.name} теперь ${toCurrencyPrice(payload.new.retail_price)}`,
//                     timestamp: new Date().getTime(),
//                   })
//                 }
//               }
//             }
//             //
//           }
//         }
//       },
//     )
//     .on(
//       'postgres_changes',
//       { event: 'UPDATE', schema: 'public', table: 'invoice_expenditure' },
//       (payload: RealtimePostgresUpdatePayload<InvoiceExpenditure>) => {
//         if (payload.new.type === 'Внутрисистемный отпуск') {
//           const { getUserStock } = useOrganizationStore()
//           const { hasCurrentUserPermission } = useClientStore()
//           const userStock = getUserStock()

//           if (
//             hasCurrentUserPermission('invoice_expenditure.process.checked') === true &&
//             payload.new.status === 'checking'
//           ) {
//             addNotification({
//               type: 'invoice_enxpenditure_checking',
//               title: 'Получен запрос на проведение накладной',
//               body: `Расходная накладная #${payload.new.slug} ожидает рассмотрения.`,
//               timestamp: new Date().getTime(),
//             })
//           } else if (userStock !== null && payload.new.recipient_stock_id === userStock.id) {
//             if (payload.new.status === 'completed') {
//               addNotification({
//                 type: 'invoice_enxpenditure_completed',
//                 title: 'Накладная одобрена',
//                 body: `Расходная накладная #${payload.new.slug} рассмотрена и проведена.`,
//                 timestamp: new Date().getTime(),
//               })
//             } else if (payload.new.status === 'cancelled') {
//               addNotification({
//                 type: 'invoice_enxpenditure_cancelled',
//                 title: 'Накладная отменена',
//                 body: `Расходная накладная #${payload.new.slug} рассмотрена и отменена.`,
//                 timestamp: new Date().getTime(),
//               })
//             }
//           }
//         }
//       },
//     )
//     .subscribe()
// })

onUnmounted(() => {
  endSession()
})
</script>

<template>
  <!-- <div v-if="syncProgress < 100" class="flex h-full">
    <PrimevuePanel header="Загрузка базы данных" class="w-80 m-auto">
      <p>Пожалуйста, подождите и не закрывайте программу</p>
      <ProgressBar :value="syncProgress" class="mt-2" />
    </PrimevuePanel>
  </div> -->
  <div v-if="currentUser !== null" class="flex h-workspace">
    <!-- <ControlPanel /> -->
    <div class="w-full">
      <TableControl />
    </div>
  </div>
</template>
