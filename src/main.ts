import './index.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'
import DialogService from 'primevue/dialogservice'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'

import App from './App.vue'
import router from './router'

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
// import { loadDeveloperTools } from '@signaldb/devtools'
// loadDeveloperTools()
// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule])

const Noir = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{surface.50}',
      100: '{surface.100}',
      200: '{surface.200}',
      300: '{surface.300}',
      400: '{surface.400}',
      500: '{surface.500}',
      600: '{surface.600}',
      700: '{surface.700}',
      800: '{surface.800}',
      900: '{surface.900}',
      950: '{surface.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.950}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.900}',
          activeColor: '{primary.800}',
        },
        highlight: {
          background: '{primary.950}',
          focusBackground: '{primary.700}',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
      },
      dark: {
        primary: {
          color: '{primary.50}',
          contrastColor: '{primary.950}',
          hoverColor: '{primary.100}',
          activeColor: '{primary.200}',
        },
        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.300}',
          color: '{primary.950}',
          focusColor: '{primary.950}',
        },
      },
    },
  },
  components: {
    button: {
      colorScheme: {
        light: {
          focus: {
            ring: {
              width: '0',
            },
          },
        },
      },
    },
    panelmenu: {
      gap: 0,
      panel: {
        padding: 0,
        background: 'transparent',
        border: {
          width: 0,
        },
        first: {
          border: {
            width: 0,
          },
        },
        last: {
          border: {
            width: 0,
          },
        },
      },
      item: {
        border: {
          radius: 0,
        },
      },
    },
    dialog: {
      title: {
        font: {
          weight: 300,
        },
      },
    },
    // datatable: {
    //   colorScheme: {
    //     light: {
    //       header: {
    //         background: '{slate.50}',
    //       },
    //       footer: {
    //         background: '{slate.50}',
    //       },
    //     },
    //   },
    // },
  },
})
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  locale: {
    apply: 'Применить',
    clear: 'Очистить',
    dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    monthNames: [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь',
    ],
    monthNamesShort: [
      'Янв',
      'Фев',
      'Мар',
      'Апр',
      'Май',
      'Июн',
      'Июл',
      'Авг',
      'Сен',
      'Окт',
      'Ноя',
      'Дек',
    ],
    dateFormat: 'dd.mm.yy',
    firstDayOfWeek: 1,
    today: 'Сегодня',
  },
  theme: {
    preset: Noir,
    options: {
      darkModeSelector: '.app-dark',
    },
  },
})

app.use(DialogService)
app.use(ConfirmationService)
app.use(ToastService)

app.mount('#app').$nextTick(() => {
  // Use contextBridge
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
})
