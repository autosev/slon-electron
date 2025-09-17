import { app, BrowserWindow, Menu, Tray, MenuItemConstructorOptions, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { makeUserNotifier, updateElectronApp, UpdateSourceType } from 'update-electron-app'
import path from 'node:path'
import Store from 'electron-store'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let mainWindow: BrowserWindow
let isQuiting = false

let tray: Tray
let trayDestroyed = false // флаг уничтожения трея

// Исправление для Windows для многократной перезагрузки приложения после обновления
if (process.platform === 'win32' && require('electron-squirrel-startup')) {
  process.exit(0)
}

// Проверка обновлений
updateElectronApp({
  updateSource: {
    type: UpdateSourceType.StaticStorage,
    baseUrl: `https://sb.autopilot-sev.ru/storage/v1/object/public/slon-releases/${process.platform}/${process.arch}`,
  },
  onNotifyUser: makeUserNotifier({
    title: 'Обновление приложения',
    detail: 'Была загружена новая версия. Перезапустите приложение, чтобы применить обновления.',
    restartButtonText: 'Перезагрузить',
    laterButtonText: 'Позже',
  }),
})

// Безопасный вызов setContextMenu
function safeSetContextMenu(menu: Electron.Menu) {
  if (!trayDestroyed && tray) {
    try {
      tray.setContextMenu(menu)
    } catch (err) {
      console.warn('Tray menu error:', err)
    }
  }
}

const trayMenu = [
  {
    label: 'Сменить пользователя',
    type: 'normal',
    click: () => {
      if (VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(VITE_DEV_SERVER_URL)
      } else {
        // mainWindow.loadFile('dist/index.html')
        mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
      }
      mainWindow.show()
    },
  },
  { type: 'separator' },
  {
    label: 'Закрыть СЛОН',
    type: 'normal',
    click: () => {
      isQuiting = true
      app.quit()
    },
  },
] as MenuItemConstructorOptions[]

const trayMenuOpen = Menu.buildFromTemplate([
  {
    label: 'Открыть',
    click: () => {
      mainWindow.show()
    },
  },
  ...trayMenu,
])
const trayMenuHide = Menu.buildFromTemplate([
  {
    label: 'Свернуть',
    click: () => {
      mainWindow.hide()
    },
  },
  ...trayMenu,
])

function getPlatformIcon() {
  const basePath = VITE_DEV_SERVER_URL ? path.join(__dirname, '../public') : process.resourcesPath
  switch (process.platform) {
    case 'win32':
      return path.join(basePath, 'icon.ico')
    case 'linux':
      return path.join(basePath, 'icon.png')
    default:
      return path.join(basePath, 'icon.icns')
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'СЛОН',
    autoHideMenuBar: false,
    show: false,
    icon: getPlatformIcon(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.webContents.openDevTools()
  }
  mainWindow.maximize()
  mainWindow.show()

  // Test active push message to Renderer-process.
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('main-process-message', new Date().toLocaleString())
  })

  mainWindow.on('close', (event) => {
    if (!isQuiting) {
      event.preventDefault()
      mainWindow.hide()
      safeSetContextMenu(trayMenuOpen)
    }
  })

  mainWindow.on('show', () => {
    safeSetContextMenu(trayMenuHide)
  })

  mainWindow.on('hide', () => {
    safeSetContextMenu(trayMenuOpen)
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // mainWindow.loadFile('dist/index.html')
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Реализация одиночного экземпляра
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // Если уже запущено — выходим
  app.quit()
} else {
  // Обработка повторного запуска
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  // Запускаем приложение
  app.whenReady().then(() => {
    createWindow()
    tray = new Tray(getPlatformIcon())

    // При клике по иконке в трее — показать/скрыть окно
    tray.on('click', () => {
      if (!mainWindow) {
        createWindow()
      } else {
        if (mainWindow.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    })

    safeSetContextMenu(trayMenuOpen) // начальное меню
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('before-quit', () => {
  isQuiting = true
  if (tray) {
    tray.destroy()
    trayDestroyed = true
  }
})

// При завершении через Ctrl+C
process.on('SIGINT', () => {
  app.quit()
})

const store = new Store()

// Обработчик для получения значения из хранилища
ipcMain.handle('electron-store-get', async (event, key) => {
  return store.get(key)
})

// Обработчик для сохранения значения в хранилище
ipcMain.handle('electron-store-set', async (event, key, value) => {
  store.set(key, value)
})
