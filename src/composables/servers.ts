import type { IServer } from '../types/app'

// Ключ, под которым мы будем хранить массив серверов в electron-store
const SERVERS_STORE_KEY = 'servers'

// Реактивная переменная, которая будет хранить список серверов.
// Она создается один раз и будет общей для всего приложения.
const servers = ref<IServer[]>([])

export function useServers() {
  /**
   * Загружает список серверов из electron-store в нашу реактивную переменную.
   * Эту функцию нужно вызвать один раз при инициализации приложения (например, в App.vue).
   */
  async function loadServers() {
    const savedServers = await window.electronStore.get(SERVERS_STORE_KEY)
    servers.value = savedServers || []
  }

  /**
   * Добавляет новый сервер.
   * @param serverData - Объект нового сервера для добавления.
   */
  async function addServer(serverData: Omit<IServer, 'id'>) {
    const newServer: IServer = {
      ...serverData,
      id: crypto.randomUUID(), // Генерируем уникальный ID
    }

    const updatedServers = [...servers.value, newServer]
    await window.electronStore.set(SERVERS_STORE_KEY, updatedServers)
    servers.value = updatedServers // Обновляем локальное состояние
  }

  /**
   * Удаляет сервер по его ID.
   * @param serverId - ID сервера для удаления.
   */
  async function removeServer(serverId: string) {
    const updatedServers = servers.value.filter((s) => s.id !== serverId)
    await window.electronStore.set(SERVERS_STORE_KEY, updatedServers)
    servers.value = updatedServers // Обновляем локальное состояние
  }

  return {
    // Мы возвращаем `readonly` версию, чтобы компоненты не могли случайно
    // изменить список серверов в обход наших функций.
    servers: readonly(servers),
    loadServers,
    addServer,
    removeServer,
  }
}
