<script setup lang="ts">
import equal from 'fast-deep-equal'
import { useToast } from 'primevue/usetoast'

const props = withDefaults(
  defineProps<{
    visible: boolean
    mode?: 'edit' | 'create'
    productItemId?: ProductItem['id']
  }>(),
  {
    mode: 'edit',
  },
)

const emit = defineEmits(['update:visible', 'updated', 'created'])

const { supabase } = useSupabase()
const toast = useToast()
const confirm = useConfirm()
const { syncManager } = useSignalDB()
const tableStore = useTableStore()
const { selectedCollectionId } = storeToRefs(tableStore)

const productItem = ref<ProductItem | ProductItemInsert>(getProductItem(props.productItemId))
const productPackages = ref<(ProductPackage | ProductPackageInsert)[]>(
  getProductPackages(props.productItemId),
)
const productBarcodes = ref<(ProductBarcode | ProductBarcodeInsert)[]>(
  getProductBarcodes(props.productItemId),
)
const productImages = ref<ProductImageUploader>(getProductImages(props.productItemId))

const productItemMeasureName = computed(
  () =>
    (
      ProductMeasures.findOne({ id: productItem.value.product_measure_id }, { reactive: false }) as
        | ProductMeasure
        | undefined
    )?.name ?? '',
)

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const haveProductImagesChanges = computed(
  () => productImages.value.insert.length > 0 || productImages.value.delete.length > 0,
)

watch(
  () => props.visible,
  (newValue) => {
    if (newValue === true) {
      productItem.value = getProductItem(props.productItemId)
      productPackages.value = getProductPackages(props.productItemId)
      productBarcodes.value = getProductBarcodes(props.productItemId)

      productImages.value = getProductImages(props.productItemId)
    }
  },
)

function getProductItem(id: ProductItem['id'] | undefined) {
  if (props.productItemId !== undefined) {
    const result = ProductItems.findOne({ id }, { reactive: false })
    if (result !== undefined) {
      return structuredClone(result) as ProductItem
    }
  }
  const productCollection = Collections.findOne(
    { id: selectedCollectionId.value },
    { reactive: false },
  ) as CollectionItem

  return {
    previous_id: null,
    collection_id: selectedCollectionId.value,
    product_brand_id: null,
    product_type_id: productCollection?.product_type_id ?? 1,
    country_id: null,
    name: '',
    characteristics: {},
    product_measure_id: 1,
    retail_price: 0,
    is_visible_on_website: false,
  } as ProductItemInsert
}

function getProductPackages(product_item_id: ProductItem['id'] | undefined) {
  if (props.mode === 'edit' && product_item_id !== undefined) {
    const result: ProductPackage[] =
      (ProductPackages.find({ product_item_id }, { reactive: false }).fetch() as
        | ProductPackage[]
        | undefined) ?? []
    return structuredClone(result)
  } else {
    return [
      {
        name: '',
        conversion_factor: 1,
        retail_price: 0,
      },
    ] as ProductPackageInsert[]
  }
}

function getProductBarcodes(product_item_id: ProductItem['id'] | undefined) {
  if (props.mode === 'edit' && product_item_id !== undefined) {
    const result: ProductBarcode[] =
      (ProductBarcodes.find({ product_item_id }, { reactive: false }).fetch() as
        | ProductBarcode[]
        | undefined) ?? []
    return structuredClone(result)
  } else {
    return [] as ProductBarcodeInsert[]
  }
}

function getProductImages(product_item_id: ProductItem['id'] | undefined): ProductImageUploader {
  if (props.mode === 'edit' && product_item_id !== undefined) {
    const result: ProductImage[] =
      (ProductImages.find({ product_item_id }, { reactive: false }).fetch() as
        | ProductImage[]
        | undefined) ?? []
    return {
      select: structuredClone(result),
      insert: [],
      delete: [],
    }
  } else {
    return {
      select: [],
      insert: [],
      delete: [],
    }
  }
}

function updateProductName(value: string | undefined) {
  if (value !== undefined) {
    productItem.value.name = value
  }
}

function updateProductBrandId(product_brand_id: ProductBrand['id']) {
  productItem.value.product_brand_id = product_brand_id
}

function updateProductMeasureId(product_measure_id: ProductMeasure['id']) {
  productItem.value.product_measure_id = product_measure_id
}

function updateProductPackageConversionFactor(
  index: number,
  value: ProductPackage['conversion_factor'],
) {
  if (productPackages.value.at(index) !== undefined) {
    productPackages.value[index].conversion_factor = value
  }
}

function updateProductCollectionId(collection_id: CollectionItem['id']) {
  productItem.value.collection_id = collection_id
  if (props.mode === 'create') {
    const collectionItem = Collections.findOne({ id: collection_id }) as CollectionItem
    if (collectionItem !== undefined) {
      productItem.value.product_type_id = collectionItem.product_type_id
    }
  }
}

function updateProductCountryId(country_id: Country['id']) {
  productItem.value.country_id = country_id
}

function updateProductTypeId(product_type_id: ProductType['id']) {
  productItem.value.product_type_id = product_type_id

  const previousProductItem = ProductItems.findOne(
    { id: props.productItemId },
    { reactive: false },
  ) as ProductItem

  if (product_type_id === previousProductItem.product_type_id) {
    productItem.value.characteristics = structuredClone(previousProductItem.characteristics)
  } else {
    productItem.value.characteristics = {}
  }
}

function updateProductProperty(key: string, value: any) {
  if (value === null) {
    delete productItem.value.characteristics[key]
  } else {
    productItem.value.characteristics[key] = value
  }
}

function updateProductWebsiteStatus(value: boolean) {
  productItem.value.is_visible_on_website = value
}

function createProductPackage(name: string) {
  if (name.length > 0 && productPackages.value.find((pkg) => pkg.name === name) === undefined) {
    productPackages.value.push({
      name,
      conversion_factor: 1,
      retail_price: 0,
    })
    return true
  } else {
    toast.add({
      severity: 'error',
      summary: 'Ошибка в названии',
      detail: `Название упаковки для товара не может повторяться.`,
      life: 4000,
    })
    return false
  }
}

function removeProductPackage(index: number) {
  const pkg = productPackages.value.at(index)
  if (pkg !== undefined) {
    const isUseless = !(
      'id' in pkg === true &&
      (InvoiceArrivalItems.findOne({ product_package_id: pkg.id }, { reactive: false }) !==
        undefined ||
        InvoiceExpenditureItems.findOne({ product_package_id: pkg.id }, { reactive: false }) !==
          undefined)
    )
    if (isUseless === true) {
      return confirm.require({
        header: 'Подтверждение',
        message: `Удалить упаковку «${pkg.name}»?`,
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
          label: 'Удалить',
          severity: 'danger',
          outlined: true,
        },
        acceptProps: {
          label: 'Отмена',
          severity: 'secondary',
          outlined: true,
        },
        reject: () => {
          productPackages.value.splice(index, 1)
        },
      })
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Нельзя удалить',
        detail: `Упаковка этого товара используется в накладных.`,
        life: 4000,
      })
    }
  }
}

function createProductBarcode(barcode: ProductBarcodeInsert) {
  const result = ProductBarcodes.findOne({ code: barcode.code }) as ProductBarcode | undefined
  if (
    barcode.code.length > 0 &&
    result === undefined &&
    productBarcodes.value.find(({ code }) => code === barcode.code) === undefined
  ) {
    productBarcodes.value.push({
      type: barcode.type,
      code: barcode.code,
    })
    return true
  } else {
    toast.add({
      severity: 'error',
      summary: 'Ошибка в коде',
      detail: `Такой штрих-код уже существует.`,
      life: 4000,
    })
    return false
  }
}

function removeProductBarcode(index: number) {
  const code = productBarcodes.value.at(index)?.code ?? ''
  return confirm.require({
    header: 'Подтверждение',
    message: `Удалить штрих-код ${code}?`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Удалить',
      severity: 'danger',
      outlined: true,
    },
    acceptProps: {
      label: 'Отмена',
      severity: 'secondary',
      outlined: true,
    },
    reject: () => {
      productBarcodes.value.splice(index, 1)
    },
  })
}

function isProductReady() {
  return !!(
    productItem.value.name !== '' &&
    productItem.value.collection_id !== null &&
    productItem.value.collection_id > 0 &&
    productItem.value.product_brand_id !== null
  )
}

function isProductChanged() {
  const previousProductItem = ProductItems.findOne(
    { id: props.productItemId },
    { reactive: false },
  ) as ProductItem
  const previousProductBarcodes = getProductBarcodes(props.productItemId)
  const previousProductPackages = getProductPackages(props.productItemId)

  if (previousProductItem !== undefined) {
    return (
      equal(previousProductItem, productItem.value) === false ||
      equal(previousProductBarcodes, productBarcodes.value) === false ||
      equal(previousProductPackages, productPackages.value) === false ||
      haveProductImagesChanges.value === true
    )
  }
  return false
}

function moveToArchive() {
  if (props.mode === 'edit' && props.productItemId !== undefined) {
    return confirm.require({
      header: 'Подтверждение',
      message: `Поместить товар ${productItem.value.name} в архив?`,
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: 'Отмена',
        severity: 'secondary',
        outlined: true,
      },
      acceptProps: {
        label: 'В архив',
      },
      accept: async () => {
        // const activeProductShipment = ProductShipments.findOne(
        //   { product_item_id: props.productItemId, quantity: { $gt: 0 } },
        //   { reactive: false },
        // ) as ProductShipment | undefined

        if ('id' in productItem.value) {
          try {
            await supabase
              .rpc('archive_product_rpc', {
                p_item_id: productItem.value.id,
              })
              .throwOnError()

            productItem.value.collection_id = null

            toast.add({
              severity: 'success',
              summary: 'Товар в архиве',
              detail: `Товар ${productItem.value.name} успешно помещен в архив.`,
              life: 3000,
            })
            return true
          } catch (e) {
            console.error('Ошибка в функции archive_product_rpc:', e)
            if (e instanceof Error) {
              let detailErrorMessage = e.message
              if (e.message.includes('permission_denied')) {
                detailErrorMessage = 'У вас нет прав для выполнения этой операции.'
              }
              toast.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: detailErrorMessage,
                life: 5000,
              })
            }
          }
        }
      },
      reject: () => {},
    })
  }
}

async function updateProductImages(
  product_item_id: ProductItem['id'] | undefined = props.productItemId,
) {
  const BUCKET_NAME = 'product-images'
  try {
    // 1. Загрузка новых файлов
    const uploadPromises = productImages.value.insert.map((file) => {
      const filePath = `product-items/${product_item_id}/${crypto.randomUUID()}` // Сохраняем в папку с ID продукта
      return supabase.storage.from(BUCKET_NAME).upload(filePath, file)
    })
    const uploadResults = await Promise.all(uploadPromises)
    const uploadError = uploadResults.find((res) => res.error)
    if (uploadError !== undefined) {
      throw uploadError
    } else {
      const insertProductImagesData = uploadResults.map((res) => ({
        product_item_id,
        path: res.data!.path,
      }))
      await supabase.from('product_image').insert(insertProductImagesData)
    }

    // 2. Удаление старых файлов
    if (productImages.value.delete.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(productImages.value.delete)
      if (deleteError !== null) {
        throw deleteError
      } else {
        await supabase.from('product_image').delete().in('path', productImages.value.delete)
      }
    }

    // Очистка состояния после успешного сохранения
    productImages.value = getProductImages(props.productItemId)
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: error?.message, life: 3000 })
    console.error(error)
  }
}

async function createProduct() {
  if (isProductReady() === true && props.mode === 'create') {
    const { data: productItemId, error: rpcError } = await supabase.rpc('create_product_rpc', {
      product_item_data: productItem.value,
      product_barcodes_data: productBarcodes.value,
      product_packages_data: productPackages.value,
    })
    if (rpcError !== null) {
      toast.add({
        severity: 'error',
        summary: 'Ошибка при создании товара',
        detail: rpcError.message,
        life: 5000,
      })
      throw rpcError
    } else {
      if (haveProductImagesChanges.value === true) {
        await updateProductImages(productItemId)
      }

      syncManager.sync('product_table_item')

      toast.add({
        severity: 'success',
        summary: 'Cоздан',
        detail: `Товар ${productItem.value.name} успешно создан.`,
        life: 3000,
      })
      emit('created', productItemId, productItem.value.collection_id)
    }
  }
}

async function updateProduct() {
  if (isProductChanged() === true && props.mode === 'edit') {
    const { error: rpcError } = await supabase.rpc('update_product_rpc', {
      product_item_data: productItem.value,
      product_barcodes_data: productBarcodes.value,
      product_packages_data: productPackages.value,
    })
    if (rpcError !== null) {
      toast.add({
        severity: 'error',
        summary: 'Ошибка при обновлении информации о товаре',
        detail: rpcError.message,
        life: 5000,
      })
      throw rpcError
    } else {
      if (haveProductImagesChanges.value === true) {
        await updateProductImages()
      }

      syncManager.sync('product_table_item')

      toast.add({
        severity: 'success',
        summary: 'Обновлен',
        detail: `Товар ${productItem.value.name} успешно обновлен.`,
        life: 3000,
      })
    }
  }
}

function closeDialog() {
  emit('update:visible', false)
}

provide('productProfile', {
  productItem,
  productPackages,
  productBarcodes,
  productImages,
  productItemMeasureName,
  mode: props.mode,
  haveProductImagesChanges,
  updateProductName,
  updateProductBrandId,
  updateProductMeasureId,
  updateProductPackageConversionFactor,
  updateProductCollectionId,
  updateProductCountryId,
  updateProductTypeId,
  updateProductProperty,
  updateProductWebsiteStatus,
  createProductPackage,
  removeProductPackage,
  createProductBarcode,
  removeProductBarcode,
  isProductChanged,
  isProductReady,
  moveToArchive,
  createProduct,
  updateProduct,
  closeDialog,
})
</script>

<template>
  <Dialog
    v-model:visible="isVisible"
    class="!bg-slate-100"
    :style="{ width: '727px' }"
    :draggable="false"
    :close-on-escape="false"
    modal
  >
    <template #header>
      <ProductProfileHeader />
    </template>
    <ProductProfileTabs />
    <template #footer>
      <ProductProfileFooter />
    </template>
  </Dialog>
</template>
