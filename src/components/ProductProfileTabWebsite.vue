<script lang="ts" setup>
import { useToast } from 'primevue/usetoast'
import type FileUpload from 'primevue/fileupload'

// --- Внедрение зависимостей ---
const injected = inject<{
  productItem: Ref<ProductItem>
  productImages: Ref<ProductImageUploader>
  haveProductImagesChanges: ComputedRef<boolean>
  updateProductWebsiteStatus: (value: boolean) => void
  // Вам понадобится функция для обновления массива изображений
  updateProductImages: (paths: string[]) => void
}>('productProfile')

if (!injected) {
  throw new Error('productProfile not provided')
}
const { productItem, productImages, haveProductImagesChanges, updateProductWebsiteStatus } =
  injected
const { supabase } = useSupabase()
const toast = useToast()

const fileUploader = ref()

const signedImageUrls = ref(new Map<string, string>()) // [path -> signedUrl]
const isLoadingUrls = ref(false)

// Генерация временных URL для приватных изображений
async function generateSignedUrls(images: ProductImage[]) {
  if (images.length === 0) return
  signedImageUrls.value.clear()
  isLoadingUrls.value = true
  const paths = images.map((img) => img.path)
  const { data, error } = await supabase.storage.from('product-images').createSignedUrls(paths, 60) // URL действителен 60 секунд
  console.log(data)
  if (error) {
    console.error('Error creating signed URLs:', error)
    toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить изображения' })
    isLoadingUrls.value = false
    return
  }

  data.forEach((item) => {
    if (item.signedUrl) {
      // Находим оригинальный путь, т.к. Supabase может его изменить
      const originalPath = paths.find((p) => item.path?.includes(p))
      if (originalPath) {
        signedImageUrls.value.set(originalPath, item.signedUrl)
      }
    }
  })
  isLoadingUrls.value = false
}

watch(
  () => productImages.value.select,
  () => {
    fileUploader.value?.clear()
    generateSignedUrls(productImages.value.select)
  },
  //   { immediate: true, deep: true },
)

function addProductImagesToInsert(files: File[]) {
  productImages.value.insert = files
}

function removeProductImageToInsert(fileToRemove: File) {
  productImages.value.insert = productImages.value.insert.filter((file) => file !== fileToRemove)
  // Синхронизируем внутреннее состояние компонента
  if (fileUploader.value) {
    fileUploader.value.files = productImages.value.insert
  }
}

function addProductImageToDelete(fileToDelete: ProductImage) {
  productImages.value.delete.push(fileToDelete.path)
  productImages.value.select = productImages.value.select.filter(
    (file) => file.path !== fileToDelete.path,
  )
}

function getObjectUrl(file: File): string {
  return URL.createObjectURL(file)
}

onMounted(() => {
  generateSignedUrls(productImages.value.select)
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <Fieldset legend="Конфигурация" class="w-full">
      <div class="flex items-center gap-2">
        <Checkbox
          :model-value="productItem.is_visible_on_website"
          @update:model-value="updateProductWebsiteStatus"
          inputId="is_visible_on_website"
          :binary="true"
        />
        <label for="is_visible_on_website"> Отображать на сайте </label>
      </div>
    </Fieldset>
    <Fieldset legend="Изображения" class="w-full">
      <FileUpload
        ref="fileUploader"
        name="gallery[]"
        @select="addProductImagesToInsert($event.files)"
        :multiple="true"
        :auto="false"
        :customUpload="true"
        :fileLimit="3"
        accept=".jpg,.jpeg,.png,.webp,.avif"
        :maxFileSize="2000000"
        :pt="{
          root: '!border-0',
          header: '!p-0 !gap-3',
          content: '!pt-3 !px-0 !pb-0',
        }"
      >
        <template #header="{ chooseCallback }">
          <Button
            label="Выбрать файлы"
            icon="pi pi-plus"
            @click="chooseCallback"
            :disabled="productImages.select.length + productImages.insert.length >= 3"
            variant="outlined"
          />
        </template>

        <template #content>
          <div
            v-if="productImages.select.length > 0 || productImages.insert.length > 0"
            class="grid grid-cols-3 gap-3"
          >
            <Card
              v-for="file in productImages.select"
              :key="file.path"
              class="border !shadow-none rounded-xl"
              :pt="{ body: 'border-t !p-3' }"
            >
              <template #header>
                <div class="w-full h-auto aspect-square bg-slate-100 rounded-t-xl">
                  <Image
                    v-if="signedImageUrls.get(file.path)"
                    :src="signedImageUrls.get(file.path)"
                    imageClass="w-full h-full object-cover rounded-t-xl"
                  />
                  <Skeleton v-else class="w-full h-full rounded-t-xl" />
                </div>
              </template>
              <template #content>
                <div class="flex gap-3 justify-between items-center">
                  <Badge>Загружено</Badge>
                  <Button
                    icon="pi pi-trash"
                    @click="addProductImageToDelete(file)"
                    severity="danger"
                    variant="outlined"
                    size="small"
                    rounded
                  />
                </div>
              </template>
            </Card>
            <Card
              v-for="(file, index) in productImages.insert"
              :key="index"
              class="border !shadow-none rounded-xl"
              :pt="{ body: 'border-t !p-3' }"
            >
              <template #header>
                <Image
                  :src="getObjectUrl(file)"
                  imageClass="w-full h-auto aspect-square object-cover rounded-t-xl"
                />
              </template>
              <template #content>
                <div class="flex gap-3 justify-between items-center">
                  <Badge severity="secondary">Новое</Badge>
                  <Button
                    icon="pi pi-trash"
                    @click="removeProductImageToInsert(file)"
                    severity="danger"
                    variant="outlined"
                    size="small"
                    rounded
                  />
                </div>
              </template>
            </Card>
          </div>
          <div v-else class="mt-4 text-center text-slate-500">
            <p>Перетащите изображения сюда или выберите файлы.</p>
          </div>
        </template>
      </FileUpload>
    </Fieldset>
  </div>
</template>
