import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import equal from 'fast-deep-equal'

export const useInvoiceArrivalStore = defineStore('invoice-arrival', () => {
  const toast = useToast()
  const confirm = useConfirm()
  const { supabase } = useSupabase()
  const { createInvoiceDocumentSlug, createInvoiceIssueDate } = useInvoice()
  const { currentUser } = storeToRefs(useClientStore())
  const { setSelectedTablePanel } = useTableStore()
  const { syncManager } = useSignalDB()

  const { selectedStockId } = storeToRefs(useTableStore())

  const selectedTab = ref<'editor' | 'draft' | 'history'>('editor')

  const editorData = reactive<InvoiceArrivalDocumentEditor>(getEmptyEditorData())
  const editorInvoiceDocumentChildren = ref<InvoiceDocument[]>([])

  const isLoading = ref(false) // Срабатывает при отправке в БД
  const drafts = reactive(
    new Map<InvoiceArrivalDocumentEditor['id'], InvoiceArrivalDocumentEditor>(
      JSON.parse(localStorage.getItem('invoice-arrival-drafts') ?? '[]'),
    ),
  )

  const isEditable = computed(
    () => editorData.invoice.status === 'new' || editorData.invoice.status === 'draft',
  )

  const isInvoiceReady = computed(
    () =>
      editorData.items.length > 0 &&
      editorData.invoice.recipient_stock_id !== null &&
      editorData.operation !== null,
  )

  const isInvoiceCorrection = computed(
    () =>
      (editorData.invoice.status === 'new' || editorData.invoice.status === 'draft') &&
      editorData.parent_id !== null,
  )

  watch(
    () => editorData.invoice.recipient_stock_id,
    (newStockId) => {
      if (newStockId !== null) {
        useTableStore().setSelectedStockId(newStockId)
      }

      if (editorData.invoice.status === 'new' || editorData.invoice.status === 'draft') {
        editorData.slug = createInvoiceDocumentSlug(newStockId, editorData.id)
      }
    },
  )

  watchEffect((onCleanup) => {
    if (
      editorData.invoice.status === 'completed' ||
      editorData.invoice.status === 'reversed' ||
      isInvoiceCorrection.value === true
    ) {
      const parent_id = editorData.parent_id ?? editorData.id
      const invoiceDocumentsCursor = InvoiceDocuments.find(
        { parent_id },
        { sort: { created_at: -1 } },
      )
      editorInvoiceDocumentChildren.value =
        (invoiceDocumentsCursor.fetch() as InvoiceDocument[] | undefined) ?? []
      onCleanup(() => {
        invoiceDocumentsCursor.cleanup()
      })
    } else {
      editorInvoiceDocumentChildren.value = []
    }
  })

  function getEmptyEditorData(stockId: number | null = null): InvoiceArrivalDocumentEditor {
    const id = crypto.randomUUID()
    return {
      id,
      slug: createInvoiceDocumentSlug(stockId, id),
      operation: null,
      issue_date: createInvoiceIssueDate(),
      note: '',
      parent_id: null,
      created_at: new Date().toISOString(),
      invoice: {
        id,
        recipient_stock_id: null,
        vendor_id: null,
        employee_id: null,
        customer_id: null,
        status: 'new',
      },
      items: [],
    }
  }

  function createEditor(
    data: InvoiceArrivalDocumentEditor | undefined = undefined,
    hasConfirm = true,
  ) {
    if (data === undefined) {
      data = getEmptyEditorData()
    }
    const initEditor = () => {
      editorData.id = data.id
      editorData.slug = data.slug
      editorData.operation = data.operation
      editorData.issue_date = data.issue_date
      editorData.parent_id = data.parent_id
      editorData.note = data.note
      editorData.created_at = data.created_at
      editorData.created_by = data.created_by
      editorData.invoice = { ...data.invoice }
      editorData.items = [...data.items]
    }
    if (
      hasConfirm === true &&
      isInvoiceReady.value === true &&
      (editorData.invoice.status === 'new' ||
        (editorData.invoice.status === 'draft' &&
          drafts.get(editorData.id) !== undefined &&
          equal(drafts.get(editorData.id), editorData) === false))
    ) {
      createDraftConfirm(initEditor)
    } else {
      initEditor()
      // Открыть вкладку реактора
      selectedTab.value = 'editor'
    }
  }

  function openEditor(id: InvoiceDocument['id']) {
    const invoiceDocument = InvoiceDocuments.findOne({ id }, { reactive: false }) as
      | InvoiceDocument
      | undefined
    if (invoiceDocument !== undefined) {
      const invoiceArrival = InvoiceArrivals.findOne({ id }, { reactive: false }) as
        | InvoiceArrival
        | undefined

      if (invoiceArrival !== undefined) {
        const invoiceArrivalItems = InvoiceArrivalItems.find(
          { invoice_arrival_id: id },
          { reactive: false },
        ).fetch() as InvoiceArrivalItem[] | undefined

        if (invoiceArrivalItems !== undefined) {
          setSelectedTablePanel('invoice-arrival')
          createEditor({
            ...invoiceDocument,
            invoice: invoiceArrival,
            items: invoiceArrivalItems,
          })
        }
      }
    }
  }

  function addItemToEditor(product_item_id: ProductItem['id']) {
    selectedTab.value = 'editor'
    if (isEditable.value === false) {
      createEditor()
    }
    if (editorData.invoice.recipient_stock_id === null && selectedStockId.value !== null) {
      editorData.invoice.recipient_stock_id = selectedStockId.value
    }

    const productPackage = ProductPackages.findOne(
      { product_item_id, name: '' },
      { reactive: false },
    ) as ProductPackage | undefined

    if (productPackage !== undefined) {
      editorData.items.push({
        invoice_arrival_id: editorData.invoice.id,
        product_item_id,
        product_package_id: productPackage.id,
        quantity: 1,
        price: 0,
      })
      return true
    } else {
      return false
    }
  }

  function removeItemFromEditor(index: number) {
    editorData.items.splice(index, 1)
  }

  function updateItemProductPackageId(index: number, productPackageId: ProductPackage['id']) {
    const editorDataItem = editorData.items[index]
    if (editorDataItem !== undefined) {
      editorDataItem.product_package_id = productPackageId
    }
  }

  function updateItemPrice(index: number, newPrice: number) {
    const editorDataItem = editorData.items[index]
    if (editorDataItem !== undefined) {
      editorDataItem.price = newPrice
    }
  }

  function updateItemQuantity(index: number, newQuantity: number) {
    const editorDataItem = editorData.items[index]
    if (editorDataItem !== undefined) {
      editorDataItem.quantity = newQuantity
    }
  }

  function createDraft() {
    editorData.invoice.status = 'draft'
    editorData.created_by = currentUser.value?.id

    editorData.created_at = new Date().toISOString()

    const editorDataCopy = JSON.parse(JSON.stringify(editorData))
    drafts.set(editorData.id, structuredClone(editorDataCopy))

    localStorage.setItem('invoice-arrival-drafts', JSON.stringify(Array.from(drafts.entries())))

    toast.add({
      severity: 'success',
      summary: 'Сохранено',
      detail: `Черновик ${editorData.slug} сохранён.`,
      life: 3000,
    })
  }

  function removeDraft(id: InvoiceArrivalDocumentEditor['id'], hasToast = true) {
    const draft = drafts.get(id)
    if (draft?.slug !== undefined) {
      const { slug } = draft
      if (drafts.delete(id) === true) {
        localStorage.setItem('invoice-arrival-drafts', JSON.stringify(Array.from(drafts.entries())))

        if (hasToast === true) {
          toast.add({
            severity: 'error',
            summary: 'Удалено',
            detail: `Черновик ${slug} удалён.`,
            life: 3000,
          })
        }
      }
    }
  }

  function openDraft(id: InvoiceArrivalDocumentEditor['id']) {
    const draft = drafts.get(id)
    if (draft !== undefined) {
      const draftCopy = JSON.parse(JSON.stringify(draft))
      createEditor(draftCopy)
    }
  }

  function afterUpdateEditorDataOperation() {
    editorData.invoice.vendor_id = null
    editorData.invoice.employee_id = null
    editorData.invoice.customer_id = null
  }

  async function createCompleted() {
    if (editorData.invoice.status === 'draft' || editorData.invoice.status === 'new') {
      const rpcParams = {
        p_invoice_document: {
          id: editorData.id,
          operation: editorData.operation,
          issue_date: editorData.issue_date,
          note: editorData.note,
          parent_id: editorData.parent_id,
        },
        p_invoice_arrival: {
          recipient_stock_id: editorData.invoice.recipient_stock_id,
          vendor_id: editorData.invoice.vendor_id,
          employee_id: editorData.invoice.employee_id,
          customer_id: editorData.invoice.vendor_id,
        },
        p_invoice_arrival_items: editorData.items,
      }

      try {
        isLoading.value = true
        const { data: completedInvoiceSlug, error: rpcError } = await supabase.rpc(
          'create_completed_invoice_arrival_rpc',
          rpcParams,
        )
        if (rpcError) {
          console.error('Ошибка при проведении приходной накладной через RPC:', rpcError)
          let detailErrorMessage = rpcError.message
          if (rpcError.message.includes('permission_denied')) {
            detailErrorMessage = 'У вас нет прав для выполнения этой операции.'
          } else if (rpcError.message.includes('invalid_type')) {
            detailErrorMessage = 'Неверный тип операции накладной.'
          }
          toast.add({
            severity: 'error',
            summary: 'Ошибка проведения',
            detail: detailErrorMessage,
            life: 5000,
          })
          isLoading.value = false
          return
        }

        if (editorData.invoice.status === 'draft') {
          removeDraft(editorData.id, false)
        }

        editorData.invoice.status = 'completed'
        editorData.slug = completedInvoiceSlug

        await syncManager.syncAll()

        isLoading.value = false

        toast.add({
          severity: 'success',
          summary: 'Успешно проведена',
          detail: `Приходная накладная ${editorData.slug} успешно проведена.`,
          life: 5000,
        })
      } catch (e) {
        isLoading.value = false
        console.error('Непредвиденная ошибка в функции create_completed_invoice_arrival_rpc:', e)
        // Проверяем, чтобы не дублировать сообщение об ошибке прав, если оно уже было показано
        if (!(e instanceof Error && e.message?.includes('permission_denied'))) {
          toast.add({
            severity: 'error',
            summary: 'Критическая ошибка',
            detail: 'Произошла непредвиденная ошибка при обработке накладной.',
            life: 5000,
          })
        }
      }
    }
  }

  function createCompletedConfirm() {
    confirm.require({
      header: 'Подтверждение',
      message: `Провести накладную ${editorData.slug}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptProps: {
        label: 'Провести',
      },
      rejectProps: {
        label: 'Нет',
        severity: 'secondary',
        outlined: true,
      },
      accept: async () => {
        await createCompleted()
      },
      reject: () => {},
    })
  }

  async function createReversed() {
    if (editorData.invoice.status === 'completed') {
      const rpcParams = {
        p_invoice_arrival_id: editorData.id,
        p_new_invoice_note: `Сторно документа ${editorData.slug}`,
      }

      try {
        isLoading.value = true
        const { error: rpcError } = await supabase.rpc(
          'create_reversed_invoice_arrival_rpc',
          rpcParams,
        )
        if (rpcError) {
          console.error('Ошибка при проведении приходной накладной через RPC:', rpcError)
          let detailErrorMessage = rpcError.message
          if (rpcError.message.includes('permission_denied')) {
            detailErrorMessage = 'У вас нет прав для выполнения этой операции.'
          } else if (rpcError.message.includes('invalid_type')) {
            detailErrorMessage = 'Неверный тип операции накладной.'
          }
          toast.add({
            severity: 'error',
            summary: 'Ошибка проведения',
            detail: detailErrorMessage,
            life: 5000,
          })
          isLoading.value = false
          return
        }

        await syncManager.syncAll()
        editorData.invoice.status = 'reversed'

        isLoading.value = false

        toast.add({
          severity: 'success',
          summary: 'Успешно проведена',
          detail: `Приходная накладная ${editorData.slug} успешно проведена.`,
          life: 5000,
        })
      } catch (e) {
        isLoading.value = false
        console.error('Непредвиденная ошибка в функции complete:', e)
        // Проверяем, чтобы не дублировать сообщение об ошибке прав, если оно уже было показано
        if (!(e instanceof Error && e.message?.includes('permission_denied'))) {
          toast.add({
            severity: 'error',
            summary: 'Критическая ошибка',
            detail: 'Произошла непредвиденная ошибка при обработке накладной.',
            life: 5000,
          })
        }
      }
    }
  }

  function createReversedConfirm() {
    confirm.require({
      header: 'Подтверждение',
      message: `Аннулировать накладную ${editorData.slug}?`,
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: 'Аннулировать',
        severity: 'danger',
        outlined: true,
      },
      acceptProps: {
        label: 'Нет',
        severity: 'secondary',
        outlined: true,
      },
      accept: () => {},
      reject: async () => {
        await createReversed()
      },
    })
  }

  function createСopyConfirm() {
    confirm.require({
      header: 'Подтверждение',
      message: `Создать новую накладную на основе ${editorData.slug}?`,
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: 'Нет',
        severity: 'secondary',
        outlined: true,
      },
      acceptProps: {
        label: 'Создать',
      },
      accept: () => {
        if (editorData.invoice.status === 'reversed') {
          const newEditorData = getEmptyEditorData(editorData.invoice.recipient_stock_id)

          newEditorData.operation = editorData.operation
          newEditorData.note = editorData.note
          newEditorData.invoice.recipient_stock_id = editorData.invoice.recipient_stock_id
          newEditorData.invoice.vendor_id = editorData.invoice.vendor_id
          newEditorData.invoice.employee_id = editorData.invoice.employee_id
          newEditorData.invoice.customer_id = editorData.invoice.customer_id
          newEditorData.items = [...editorData.items]

          createEditor(newEditorData)
        }
      },
      reject: () => {},
    })
  }

  function createDraftConfirm(f: Function) {
    selectedTab.value = 'editor'

    confirm.require({
      header: 'Подтверждение',
      message: `Сохранить накладную ${editorData.slug}?`,
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: 'Нет',
        severity: 'secondary',
        outlined: true,
      },
      acceptProps: {
        label: 'Сохранить',
      },
      accept: () => {
        createDraft()
        f()
      },
      reject: () => {
        f()
      },
    })
  }

  function removeDraftConfirm() {
    confirm.require({
      header: 'Подтверждение',
      message: `Удалить черновик накладной ${editorData.slug}?`,
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: 'Удалить',
        severity: 'danger',
        outlined: true,
      },
      acceptProps: {
        label: 'Нет',
        severity: 'secondary',
        outlined: true,
      },
      accept: () => {},
      reject: () => {
        removeDraft(editorData.id)
        createEditor(undefined, false)
      },
    })
  }

  return {
    selectedTab,
    editorData,
    editorInvoiceDocumentChildren,
    drafts,
    isEditable,
    isInvoiceReady,
    isInvoiceCorrection,
    isLoading,
    createEditor,
    openEditor,
    addItemToEditor,
    removeItemFromEditor,
    updateItemProductPackageId,
    updateItemPrice,
    updateItemQuantity,
    removeDraft,
    createDraft,
    createDraftConfirm,
    removeDraftConfirm,
    openDraft,
    afterUpdateEditorDataOperation,
    createCompletedConfirm,
    createReversedConfirm,
    createСopyConfirm,
  }
})
