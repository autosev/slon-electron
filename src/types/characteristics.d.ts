export {}

declare global {
  /**
   * Базовый интерфейс для поля характеристики.
   */
  interface BaseCharacteristicField {
    component: string // Строковое имя компонента PrimeVue (например, 'Calendar', 'InputMask')
    key: string
    label: string
    // type: 'string' | 'number' | 'boolean' | 'enum' // Оставим это для базовой логики
    required?: boolean
    defaultValue?: any
    unit?: string // Единицы измерения, если применимо

    // Добавляем `props` для передачи любых пропсов напрямую компоненту PrimeVue
    props: Record<string, any>
  }

  /**
   * Интерфейс для текстовых полей.
   * Теперь может иметь специфичные пропсы для InputText, InputTextarea и т.д.
   */
  interface StringCharacteristicField extends BaseCharacteristicField {
    type: 'string'
    minLength?: number
    maxLength?: number
    pattern?: string
    // `props` может содержать { autoResize: true } для Textarea
  }

  /**
   * Интерфейс для числовых полей.
   * Теперь может иметь специфичные пропсы для InputNumber.
   */
  interface NumberCharacteristicField extends BaseCharacteristicField {
    type: 'number'
    min?: number
    max?: number
    // `props` может содержать { mode: 'decimal', showButtons: true }
  }

  /**
   * Интерфейс для булевых полей.
   * Теперь может иметь специфичные пропсы для Checkbox.
   */
  interface BooleanCharacteristicField extends BaseCharacteristicField {
    type: 'boolean'
  }

  /**
   * Интерфейс для полей с выбором из списка (enum).
   * Теперь может иметь специфичные пропсы для Dropdown.
   */
  interface EnumCharacteristicField extends BaseCharacteristicField {
    type: 'enum'
    options: (string | number | object)[] // Может быть массив объектов { label: '...', value: '...' }
    // `props` может содержать { optionLabel: 'name', optionValue: 'code' }
  }

  /**
   * Объединенный тип для всех возможных полей характеристик.
   */
  type CharacteristicField =
    | StringCharacteristicField
    | NumberCharacteristicField
    | BooleanCharacteristicField
    | EnumCharacteristicField
}
