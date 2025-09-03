import { useDayjs } from './dayjs'

const dayjs = useDayjs()
const { getStockCode } = useOrganizationStore()

export const useTools = () => {
  function morph(int: number, array: string[]) {
    return (
      (array = array) &&
      array[int % 100 > 4 && int % 100 < 20 ? 2 : [2, 0, 1, 1, 1, 2][int % 10 < 5 ? int % 10 : 5]]
    )
  }

  const phoneStrip = (value: string) => value.replace(/[+\s()_\-]/g, '')

  function priceDelimiter(value: number | string) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  function toCurrencyPrice(value: number | string) {
    return `${priceDelimiter(value)} ₽`
  }

  function createInvoiceDocumentSlug(stockId: Stock['id'] | null, invoiceId: string) {
    return getStockCode(stockId) + `-${invoiceId.slice(0, 8)}`
  }

  function getEmployeeFullName(id: Employee['id'] | undefined) {
    if (id !== undefined) {
      const employee = Employees.findOne({ id }, { reactive: false }) as Employee | undefined
      if (employee !== undefined) {
        return employee.first_name + ' ' + employee.last_name
      }
    }
    return 'Неизвестный пользователь'
  }

  function createInvoiceIssueDate() {
    return dayjs().format('YYYY-MM-DD')
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

  function countryCodeToEmoji(code: string): string | null {
    const upperCode = code.toUpperCase()

    if (!/^[A-Z]{2}$/.test(upperCode)) {
      return null
    }

    const emoji = upperCode
      .split('')
      .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
      .join('')

    return emoji
  }

  return {
    morph,
    phoneStrip,
    priceDelimiter,
    toCurrencyPrice,
    getEmployeeFullName,
    createInvoiceDocumentSlug,
    createInvoiceIssueDate,
    getInvoiceReverseType,
    countryCodeToEmoji,
  }
}
