<script setup lang="ts">
interface TopicFile {
  topic: string
  file: string
}

interface Topic {
  [key: string]: TopicFile[]
}

const topics = ref<Topic>({})
const selectedTopic = ref<string | null>(null)

// Функция для загрузки файлов
function loadFiles() {
  const context = import.meta.glob('../assets/faq/**/*.md')
  const files = Object.keys(context).map((key) => {
    const pathParts = key.split('/')
    const topicName = pathParts[3] // Имя темы
    const fileName = pathParts[4] // Имя файла

    return {
      topic: topicName,
      file: fileName,
    }
  }) as TopicFile[]

  topics.value = Object.groupBy(files, (file) => file.topic) as Topic
}

onMounted(() => loadFiles())
</script>

<template>
  <div class="mx-5">
    <div v-if="selectedTopic === null" class="flex flex-col gap-3">
      <span class="text-sm text-center text-slate-700 italic mb-2 select-none"
        >Руководство для помощи в использовании программы</span
      >
      <Button
        v-for="topic in Object.keys(topics)"
        :label="topic"
        severity="contrast"
        variant="outlined"
        @click="selectedTopic = topic"
        rounded
        fluid
      />
    </div>
    <div v-else class="flex flex-col gap-3">
      <Button label="Назад" icon="pi pi-arrow-left" @click="selectedTopic = null" fluid rounded />
      <h3 class="mt-3 font-semibold">{{ selectedTopic }}</h3>
      <Button
        v-for="{ file } in topics[selectedTopic]"
        :label="file.split('.md').at(0)"
        severity="contrast"
        variant="outlined"
        fluid
      />
    </div>
  </div>
</template>
