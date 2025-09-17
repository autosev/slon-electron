import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'start',
      component: () => import('../views/StartView.vue'),
      beforeEnter(to, from, next) {
        const { getUsers } = useAuth()
        const users = getUsers() // getServers
        if (users.length > 0) {
          next({ name: 'welcome' })
        } else {
          next({ name: 'server' })
        }
      },
    },
    {
      path: '/server',
      name: 'server',
      component: () => import('../views/ServerView.vue'),
    },
    {
      path: '/server/deploy',
      name: 'server-deploy',
      component: () => import('../views/ServerDeployView.vue'),
    },
    {
      path: '/server/connect',
      name: 'server-connect',
      component: () => import('../views/ServerConnectView.vue'),
    },
    {
      path: '/user/login',
      name: 'user-login',
      component: () => import('../views/UserLoginView.vue'),
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: () => import('../views/WelcomeView.vue'),
    },
    {
      path: '/workspace',
      name: 'workspace',
      component: () => import('../views/WorkspaceView.vue'),
    },
  ],
})

export default router
