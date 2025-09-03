import { RealtimeChannel } from '@supabase/supabase-js'

// Его структура будет: { user_id_1: [presence_info], user_id_2: [presence_info] }
const onlineUsers = ref({})
const { supabase } = useSupabase()
const { getUser } = useAuth()
let channel: RealtimeChannel | null = null // Переменная для хранения нашего канала

export function useOnlineStatus() {
  /**
   * Подключается к каналу и начинает отслеживание.
   */
  const subscribeToChannel = () => {
    // Получаем текущего пользователя для использования его ID в качестве ключа
    const user = getUser()
    if (!user) return // Не подключаемся, если пользователь не аутентифицирован

    // 1. Создаем канал с уникальным ключом для каждого пользователя
    channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    })

    // 2. Настраиваем обработчики событий

    channel
      ?.on('presence', { event: 'sync' }, () => {
        // 'sync' вызывается при первом подключении и синхронизирует состояние
        console.log('Synced presences: ', channel?.presenceState())
        onlineUsers.value = channel?.presenceState()
      })
      ?.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // 'join' вызывается, когда кто-то присоединяется
        console.log('User joined:', key, newPresences)
        // Просто обновляем всё состояние для простоты
        onlineUsers.value = channel?.presenceState()
      })
      ?.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // 'leave' вызывается, когда кто-то уходит
        console.log('User left:', key, leftPresences)
        onlineUsers.value = channel?.presenceState()
      })

    // 3. Подписываемся на канал
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Как только подписка активна, отправляем свой статус
        // Можно передать любые метаданные, например, время входа
        await channel?.track({ online_at: new Date().toISOString() })
        console.log('Successfully subscribed and tracking status!')
      }
    })
  }

  /**
   * Отписывается от канала.
   */
  const unsubscribeFromChannel = () => {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
      onlineUsers.value = {}
      console.log('Unsubscribed from channel.')
    }
  }

  // Возвращаем реактивное состояние и функции для управления
  return {
    onlineUsers,
    subscribeToChannel,
    unsubscribeFromChannel,
  }
}
