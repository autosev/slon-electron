import { useDayjs } from './dayjs'

const dayjs = useDayjs()
const { getStockCode } = useOrganizationStore()

const operationNames = {
  arrival_from_vendor: 'Приход товара от поставщика',
  arrival_customer_return: 'Возврат товара от покупателя',
  arrival_employee_return: 'Возврат товара от персонала',
  expenditure_to_customer: 'Отпуск товара покупателю',
  expenditure_internal: 'Внутрисистемный отпуск',
  expenditure_vendor_return: 'Возврат товара поставщику',
  expenditure_to_employee: 'Отпуск товара персоналу',
}

export const useInvoice = () => {
  function createInvoiceDocumentSlug(stockId: Stock['id'] | null, invoiceId: string) {
    return getStockCode(stockId) + `-${invoiceId.slice(0, 8)}`
  }

  function createInvoiceIssueDate() {
    return dayjs().format('YYYY-MM-DD')
  }

  function getInvoiceOperationName(operation: InvoiceOperation) {
    return operationNames[operation] || operation
  }

  function getInvoiceReverseType(type: string) {
    switch (type) {
      case 'Приход товара от поставщика':
        return 'Возврат товара поставщику'
      case 'Возврат товара от покупателя':
        return 'Отпуск товара покупателю'
      case 'Возврат товара от персонала':
        return 'Отпуск товара персоналу'

      case 'Отпуск товара покупателю':
        return 'Возврат товара от покупателя'
      case 'Внутрисистемный отпуск':
        return 'Внутрисистемный отпуск'
      case 'Возврат товара поставщику':
        return 'Приход товара от поставщика'
      case 'Отпуск товара персоналу':
        return 'Возврат товара от персонала'

      default:
        return null
    }
  }

  return {
    createInvoiceDocumentSlug,
    createInvoiceIssueDate,
    getInvoiceReverseType,
    getInvoiceOperationName,
  }
}
