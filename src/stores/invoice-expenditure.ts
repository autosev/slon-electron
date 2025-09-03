import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import IEShipmentSelect from '../components/IEShipmentSelect.vue'
import equal from 'fast-deep-equal'

export const useInvoiceExpenditureStore = defineStore('invoice-expenditure', () => {
  const toast = useToast()
  const confirm = useConfirm()
  const dialog = useDialog()
  const { supabase } = useSupabase()
  const { createInvoiceDocumentSlug, createInvoiceIssueDate } = useTools()
  const clientStore = useClientStore()
  const { hasCurrentUserPermission } = clientStore
  const { currentUser } = storeToRefs(clientStore)
  const { setSelectedTablePanel } = useTableStore()
  const { syncManager } = useSignalDB()

  const { selectedStockId } = storeToRefs(useTableStore())
  // const { getStockById } = useOrganizationStore()

  const selectedTab = ref<'editor' | 'draft' | 'history'>('editor')

  const editorData = reactive<InvoiceExpenditureDocumentEditor>(getEmptyEditorData())
  const editorInvoiceDocumentChildren = ref<InvoiceDocument[]>([])

  const isLoading = ref(false) // Срабатывает при отправке в БД
  const drafts = reactive(
    new Map<InvoiceExpenditureDocumentEditor['id'], InvoiceExpenditureDocumentEditor>(
      JSON.parse(localStorage.getItem('invoice-expenditure-drafts') ?? '[]'),
    ),
  )

  const isInvoiceReady = computed(
    () =>
      editorData.items.length > 0 &&
      editorData.invoice.sender_stock_id !== null &&
      editorData.operation !== null &&
      ((editorData.operation === 'expenditure_internal' &&
        editorData.invoice.recipient_stock_id !== null) ||
        (editorData.operation === 'expenditure_vendor_return' &&
          editorData.invoice.recipient_stock_id === null) ||
        ((editorData.operation === 'expenditure_to_employee' ||
          editorData.operation === 'expenditure_to_customer') &&
          editorData.invoice.recipient_stock_id === null &&
          editorData.invoice.vendor_id === null)),
  )

  const isInvoiceCorrection = computed(
    () =>
      (editorData.invoice.status === 'new' || editorData.invoice.status === 'draft') &&
      editorData.parent_id !== null,
  )

  const isEditable = computed(
    () =>
      editorData.invoice.status === 'new' ||
      editorData.invoice.status === 'draft' ||
      (editorData.invoice.status === 'prior' &&
        hasCurrentUserPermission('invoice_expenditure.process.checked') === true),
  )

  watch(
    () => editorData.invoice.sender_stock_id,
    (newStockId) => {
      if (newStockId !== null) {
        useTableStore().setSelectedStockId(newStockId)
      }

      if (editorData.invoice.status === 'new' && editorData.items.length === 0) {
        editorData.slug = createInvoiceDocumentSlug(newStockId, editorData.id)
      }
    },
  )

  watchEffect((onCleanup) => {
    if (editorData.invoice.status === 'completed' || editorData.invoice.status === 'reversed') {
      const parent_id = editorData.parent_id !== null ? editorData.parent_id : editorData.id
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

  function getEmptyEditorData(): InvoiceExpenditureDocumentEditor {
    const id = crypto.randomUUID()
    return {
      id,
      slug: createInvoiceDocumentSlug(null, id),
      operation: null,
      issue_date: createInvoiceIssueDate(),
      note: '',
      parent_id: null,
      created_at: new Date().toISOString(),
      invoice: {
        id,
        sender_stock_id: null,
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
    data: InvoiceExpenditureDocumentEditor | undefined = undefined,
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
      const invoiceExpenditure = InvoiceExpenditures.findOne({ id }, { reactive: false }) as
        | InvoiceExpenditure
        | undefined

      if (invoiceExpenditure !== undefined) {
        const invoiceExpenditureItems = InvoiceExpenditureItems.find(
          { invoice_expenditure_id: id },
          { reactive: false },
        ).fetch() as InvoiceExpenditureItem[] | undefined

        if (invoiceExpenditureItems !== undefined) {
          setSelectedTablePanel('invoice-expenditure')
          createEditor({
            ...invoiceDocument,
            invoice: invoiceExpenditure,
            items: invoiceExpenditureItems,
          })
        }
      }
    }
  }

  function addItemToEditor(
    product_item_id: ProductItem['id'],
    retail_price: InvoiceExpenditureItem['retail_price'],
  ) {
    selectedTab.value = 'editor'
    if (isEditable.value === false) {
      createEditor()
    }

    if (editorData.invoice.sender_stock_id === null && selectedStockId.value !== null) {
      editorData.invoice.sender_stock_id = selectedStockId.value
    }

    const shipments = ProductShipments.find(
      {
        id: {
          $nin: editorData.items.map((item) => item.product_shipment_id),
        },
        product_item_id,
        stock_id: editorData.invoice.sender_stock_id,
        quantity: { $gt: 0 },
      },
      { sort: { arrival_date: 1 }, reactive: false },
    ).fetch() as ProductShipment[]

    if (shipments.length > 1) {
      // выбор поставки
      const dialogRef = dialog.open(
        h(IEShipmentSelect, {
          productItemId: product_item_id,
          shipments,
          onSelect: (product_shipment_id: ProductShipment['id']) => {
            const productPackage = ProductPackages.findOne(
              { product_item_id, name: '' },
              { reactive: false },
            ) as ProductPackage | undefined

            if (productPackage !== undefined) {
              editorData.items.push({
                invoice_expenditure_id: editorData.id,
                product_item_id,
                product_shipment_id,
                product_package_id: productPackage.id,
                retail_price,
                quantity: 1,
              })
            } else {
              // ошибка
            }

            dialogRef.close()
          },
        }),
        {
          props: {
            modal: true,
            header: 'Выбор партии',
            style: { width: '300px' },
            draggable: false,
          },
        },
      )
    } else if (shipments.length === 1) {
      const productPackage = ProductPackages.findOne(
        { product_item_id, name: '' },
        { reactive: false },
      ) as ProductPackage | undefined

      if (productPackage !== undefined) {
        editorData.items.push({
          invoice_expenditure_id: editorData.id,
          product_item_id,
          product_shipment_id: shipments[0].id,
          product_package_id: productPackage.id,
          retail_price,
          quantity: 1,
        })
      } else {
        // такая же ошибка
      }
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Не найдено',
        detail: `Поставок для этого товара больше нет.`,
        life: 3000,
      })
    }
    return true
  }

  function removeItemFromEditor(index: number) {
    editorData.items.splice(index, 1)
  }

  function updateItemProductPackageId(index: number, productPackageId: ProductPackage['id']) {
    const editorDataItem = editorData.items[index]
    if (editorDataItem !== undefined) {
      editorDataItem.product_package_id = productPackageId

      const productPackage = ProductPackages.findOne(
        { id: productPackageId },
        { reactive: false },
      ) as ProductPackage | undefined
      if (productPackage !== undefined) {
        updateItemRetailPrice(index, productPackage.retail_price)
      }
    }
  }

  function updateItemRetailPrice(index: number, newPrice: number) {
    const editorDataItem = editorData.items[index]
    if (editorDataItem !== undefined) {
      editorDataItem.retail_price = newPrice
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
    drafts.set(editorData.id, editorDataCopy)

    localStorage.setItem('invoice-expenditure-drafts', JSON.stringify(Array.from(drafts.entries())))

    toast.add({
      severity: 'success',
      summary: 'Сохранено',
      detail: `Черновик ${editorData.slug} сохранён.`,
      life: 3000,
    })
  }

  function removeDraft(id: InvoiceExpenditure['id'], hasToast = true) {
    const draft = drafts.get(id)
    if (draft?.slug !== undefined) {
      const { slug } = draft
      if (drafts.delete(id) === true) {
        editorData.invoice.status = 'new'
        localStorage.setItem(
          'invoice-expenditure-drafts',
          JSON.stringify(Array.from(drafts.entries())),
        )

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

  function openDraft(id: InvoiceExpenditure['id']) {
    const draft = drafts.get(id)
    if (draft !== undefined) {
      const draftCopy = JSON.parse(JSON.stringify(draft))
      createEditor(draftCopy)
    }
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

  function afterUpdateEditorDataType() {
    editorData.invoice.recipient_stock_id = null
    editorData.invoice.vendor_id = null
  }

  async function createCompleted() {
    if (editorData.invoice.status === 'draft' || editorData.invoice.status === 'new') {
      const rpcParams = {
        p_invoice_document: {
          id: editorData.id,
          operation: editorData.operation,
          issue_date: editorData.issue_date,
          note: editorData.note,
        },
        p_invoice_expenditure: {
          recipient_stock_id: editorData.invoice.recipient_stock_id,
          sender_stock_id: editorData.invoice.sender_stock_id,
          vendor_id: editorData.invoice.vendor_id,
          employee_id: editorData.invoice.employee_id,
          customer_id: editorData.invoice.vendor_id,
        },
        p_invoice_expenditure_items: editorData.items,
      }

      try {
        isLoading.value = true
        const { data: completedInvoiceSlug, error: rpcError } = await supabase.rpc(
          'create_completed_invoice_expenditure_rpc',
          rpcParams,
        )
        if (rpcError) {
          console.error('Ошибка при проведении расходной накладной через RPC:', rpcError)
          let detailErrorMessage = rpcError.message
          if (rpcError.message.includes('permission_denied')) {
            detailErrorMessage = 'У вас нет прав для выполнения этой операции.'
          } else if (rpcError.message.includes('invalid_type')) {
            detailErrorMessage = 'Неверный тип операции расходной накладной.'
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
          detail: `Расходная накладная ${editorData.slug} успешно проведена.`,
          life: 5000,
        })
      } catch (e) {
        isLoading.value = false
        console.error(
          'Непредвиденная ошибка в функции create_completed_invoice_expenditure_rpc:',
          e,
        )
        // Проверяем, чтобы не дублировать сообщение об ошибке прав, если оно уже было показано
        if (!(e instanceof Error && e.message?.includes('permission_denied'))) {
          toast.add({
            severity: 'error',
            summary: 'Критическая ошибка',
            detail: 'Произошла непредвиденная ошибка при обработке расходной накладной.',
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

  return {
    selectedTab,
    editorData,
    editorInvoiceDocumentChildren,
    drafts,
    isInvoiceReady,
    isEditable,
    isInvoiceCorrection,
    isLoading,
    createEditor,
    openEditor,
    addItemToEditor,
    removeItemFromEditor,
    updateItemProductPackageId,
    updateItemRetailPrice,
    updateItemQuantity,
    removeDraft,
    removeDraftConfirm,
    createDraft,
    openDraft,
    afterUpdateEditorDataType,
    createCompletedConfirm,
  }
})
