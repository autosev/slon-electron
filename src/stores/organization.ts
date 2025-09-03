interface GroupedOrganization {
  id: number
  name: string
  website: string
  stocks: Stock[]
}

export const useOrganizationStore = defineStore('organization', () => {
  const organizations = ref<GroupedOrganization[]>([])
  const stocks = ref<Stock[]>([])

  watchEffect((onCleanup) => {
    const organizationsCursor = Organizations.find()
    const organizationData = organizationsCursor.fetch() as Organization[]

    const stocksCursor = Stocks.find()
    stocks.value = stocksCursor.fetch() as Stock[]

    setOrganizations(organizationData)

    onCleanup(() => {
      organizationsCursor.cleanup()
      stocksCursor.cleanup()
    })
  })

  function getUserStock() {
    const { currentUser } = storeToRefs(useClientStore())
    return (
      stocks.value.find(
        (stock) =>
          typeof currentUser.value?.session !== 'string' &&
          stock.id === currentUser.value?.session.user.user_metadata.stock_id,
      ) || null
    )
  }

  function getStockById(id: Stock['id']) {
    return stocks.value.find((stock) => stock.id === id) || null
  }

  function getStockCode(id: Stock['id'] | null) {
    return id !== null ? stocks.value.find((stock) => stock.id === id)?.code || 'ММ' : 'ММ'
  }

  function setOrganizations(organizationNewData: Organization[]) {
    organizations.value = organizationNewData.map((organization) => ({
      id: organization.id,
      name: organization.name,
      website: organization.website,
      stocks: stocks.value.filter((stock) => stock.organization_id === organization.id),
    }))
  }

  return { organizations, stocks, getUserStock, getStockById, getStockCode }
})
