import type { Session } from '@supabase/supabase-js'
import AES from 'crypto-js/aes'
import encUtf8 from 'crypto-js/enc-utf8'
// import { jwtDecode } from 'jwt-decode'

export const useAuth = () => {
  const LOCAL_STORAGE_AUTH_TOKEN_KEY = 'sb-sb-auth-token'
  const LOCAL_STORAGE_AUTH_USERS = 'auth-users'

  const { setCurrentUser } = useClientStore()

  // Используем Map<string, User> вместо User[]
  const authUsers: Map<string, User> = getAuthUsers()

  function getAuthUsers(): Map<string, User> {
    const storedUsers = localStorage.getItem(LOCAL_STORAGE_AUTH_USERS)
    // Преобразуем массив пар [key, value] обратно в Map
    return new Map(JSON.parse(storedUsers || '[]'))
  }

  // Функция для сохранения Map в localStorage
  function saveAuthUsers() {
    // Конвертируем Map в массив для корректной сериализации в JSON
    localStorage.setItem(LOCAL_STORAGE_AUTH_USERS, JSON.stringify(Array.from(authUsers.entries())))
  }

  function addUser(session: Session) {
    const { id } = session.user
    const name = `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name.slice(0, 1)}`

    // Используем set для добавления или обновления пользователя
    authUsers.set(id, { id, name, session })
    saveAuthUsers()
  }

  function getUser() {
    const localStorageData = localStorage.getItem(LOCAL_STORAGE_AUTH_TOKEN_KEY)

    if (localStorageData !== null) {
      const session = JSON.parse(localStorageData) as Session
      // Прямой доступ к пользователю по id с помощью get()
      const user = authUsers.get(session.user.id)

      if (user) {
        return { ...user, session }
      }
    }
    return null
  }

  function setUserPassword(newPassword: string, oldPassword = '') {
    const localStorageData = localStorage.getItem(LOCAL_STORAGE_AUTH_TOKEN_KEY)

    if (localStorageData !== null) {
      const session = JSON.parse(localStorageData) as Session
      const authUser = authUsers.get(session.user.id)

      if (authUser) {
        const isSessionHasPassword = getUserSessionPasswordStatus(session.user.id)

        if (isSessionHasPassword === true && newPassword !== '' && oldPassword !== '') {
          try {
            const bytes = AES.decrypt(String(authUser.session), oldPassword)
            const decryptSession = JSON.parse(bytes.toString(encUtf8))
            authUser.session = AES.encrypt(JSON.stringify(decryptSession), newPassword).toString()
            saveAuthUsers()
            return true
          } catch {
            return false
          }
        } else if (isSessionHasPassword !== true && newPassword !== '') {
          authUser.session = AES.encrypt(JSON.stringify(session), newPassword).toString()
          saveAuthUsers()
          return true
        }
      }
    }
    return false
  }

  function removeUserPassword() {
    const localStorageData = localStorage.getItem(LOCAL_STORAGE_AUTH_TOKEN_KEY)

    if (localStorageData !== null) {
      const session = JSON.parse(localStorageData) as Session
      const authUser = authUsers.get(session.user.id)

      if (authUser) {
        authUser.session = session
        saveAuthUsers()
        return true
      }
    }
    return false
  }

  function getUsers() {
    // Получаем значения из Map и преобразуем их в массив нужного формата
    return Array.from(authUsers.values()).map(({ id, name }) => ({ id, name }))
  }

  function updateUserConfig(userId: User['id'], config: UserConfig) {
    const authUser = authUsers.get(userId)
    if (authUser) {
      authUser.config = config
      saveAuthUsers()
    }
  }

  function updateSession(session: Session) {
    const authUser = authUsers.get(session.user.id)
    if (authUser) {
      authUser.session = session
      saveAuthUsers()
    }
  }

  function startSession(userId: Session['user']['id'], password = '') {
    const authUser = authUsers.get(userId)
    if (authUser) {
      let { session } = authUser
      const isSessionHasPassword = getUserSessionPasswordStatus(userId)

      if (!isSessionHasPassword || (isSessionHasPassword && password !== '')) {
        if (isSessionHasPassword && typeof session === 'string') {
          try {
            const sessionString = AES.decrypt(session, password).toString(encUtf8)
            session = JSON.parse(sessionString)
          } catch {
            return false
          }
        }
        localStorage.setItem(LOCAL_STORAGE_AUTH_TOKEN_KEY, JSON.stringify(session))
        setCurrentUser({ ...authUser, session })
        return true
      }
    }
    return false
  }

  function endSession() {
    localStorage.removeItem(LOCAL_STORAGE_AUTH_TOKEN_KEY)
    setCurrentUser(null)
  }

  function getUserSessionPasswordStatus(userId: Session['user']['id']) {
    const user = authUsers.get(userId)
    // Проверяем, что пользователь существует и его сессия - строка (зашифрована)
    return !!user && typeof user.session === 'string'
  }

  return {
    addUser,
    getUsers,
    getUser,
    setUserPassword,
    removeUserPassword,
    updateUserConfig,
    updateSession,
    startSession,
    endSession,
    getUserSessionPasswordStatus,
  }
}
