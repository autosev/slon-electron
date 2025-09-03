import NotificationSound from '../assets/notification.mp3'

interface NotificationItem {
  type:
    | 'retail_price_update'
    | 'invoice_enxpenditure_checking'
    | 'invoice_enxpenditure_cancelled'
    | 'invoice_enxpenditure_completed'
  title: string
  body: string
  timestamp: number
  click?: Function
  userRead?: {
    id: string
    name: string
  }
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<NotificationItem[]>(
    JSON.parse(localStorage.getItem('notifications') ?? '[]'),
  )

  const notificationsUnreadCount = computed(
    () => notifications.value.filter((notification) => notification.userRead === undefined).length,
  )

  function notificationsPush(item: NotificationItem, limit = 200) {
    notifications.value.unshift(item) // добавляем в начало
    if (notifications.value.length > limit) {
      notifications.value.pop() // удаляем последний
    }
  }

  function addNotification(newNotification: NotificationItem) {
    const sound = new Audio(NotificationSound)
    sound.play()
    new Notification(newNotification.title, { body: newNotification.body })
    notificationsPush(newNotification)
    localStorage.setItem('notifications', JSON.stringify(notifications.value))
  }

  function markNotificationsAsRead() {
    const notificationReadDate = Number(localStorage.getItem('notifications-read-timestamp'))
    const { currentUser } = storeToRefs(useClientStore())

    if (currentUser.value !== null) {
      const { id, name } = currentUser.value
      notifications.value = notifications.value.map((item) => {
        if (item.timestamp > notificationReadDate) {
          return {
            ...item,
            userRead: { id, name },
          }
        }
        return item
      })
      console.log(notifications.value)

      const newNotificationReadDate = new Date().getTime()
      localStorage.setItem('notifications-read-timestamp', newNotificationReadDate.toString())
      localStorage.setItem('notifications', JSON.stringify(notifications.value))
    }
  }

  function productItemRetailPriceCheckUpdate(newProductItem: ProductItem) {
    const oldProductItem = ProductItems.findOne({ id: newProductItem.id }, { reactive: false }) as
      | ProductItem
      | undefined

    if (
      oldProductItem !== undefined &&
      oldProductItem.retail_price !== newProductItem.retail_price
    ) {
      const { toCurrencyPrice } = useTools()
      const { getUserStock } = useOrganizationStore()
      const userStock = getUserStock()

      if (userStock !== null) {
        const productShipmentInStock = ProductShipments.findOne(
          { product_item_id: newProductItem.id, stock_id: userStock.id, quantity: { $gt: 0 } },
          { reactive: false },
        ) as ProductShipment | undefined

        if (productShipmentInStock !== undefined) {
          const productBrand = ProductBrands.findOne(
            { id: newProductItem.product_brand_id },
            { reactive: false },
          ) as ProductBrand | undefined

          if (productBrand !== undefined) {
            addNotification({
              type: 'retail_price_update',
              title: 'Изменение розничной цены',
              body: `Цена товара ${productBrand.name} ${newProductItem.name} теперь ${toCurrencyPrice(newProductItem.retail_price)}`,
              timestamp: new Date().getTime(),
            })
          }
        }
      }
    }
  }

  return {
    notifications,
    notificationsUnreadCount,
    addNotification,
    markNotificationsAsRead,
    productItemRetailPriceCheckUpdate,
  }
})
