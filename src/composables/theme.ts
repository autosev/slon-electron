type Theme = 'light' | 'dark' | 'system'
const THEME_STORE_KEY = 'theme-preference'

const currentTheme = ref<Theme>('system')
const isDark = ref<boolean>(true)

export function useTheme() {
  async function applyTheme(theme: Theme) {
    if (theme === 'system') {
      isDark.value = await window.theme.getDarkStatus()
      await window.theme.set('system')
    } else {
      isDark.value = theme === 'dark'
      await window.theme.set(theme)
    }

    document.documentElement.classList.toggle('app-dark', isDark.value)
    if (isDark.value === true) {
      document.body.dataset.agThemeMode = 'app-dark'
    } else {
      document.body.dataset.agThemeMode = 'app-light'
    }

    currentTheme.value = theme
  }

  async function setTheme(theme: Theme) {
    await applyTheme(theme)
    await window.electronStore.set(THEME_STORE_KEY, theme)
  }

  async function toggleTheme() {
    isDark.value = await window.theme.getDarkStatus()
    const theme: Theme = isDark.value === true ? 'light' : 'dark'
    await applyTheme(theme)
    await window.electronStore.set(THEME_STORE_KEY, theme)
  }

  async function loadTheme() {
    const savedTheme = await window.electronStore.get(THEME_STORE_KEY)
    await applyTheme(savedTheme || 'system')
  }

  watch(currentTheme, (newTheme) => {
    if (newTheme === 'system') {
      applyTheme('system')
    }
  })

  return {
    currentTheme,
    isDark,
    setTheme,
    toggleTheme,
    loadTheme,
  }
}
