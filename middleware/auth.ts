import { useUserStore } from '~/stores/user'

export default defineNuxtRouteMiddleware((to) => {
  const userStore = useUserStore()
  
  // 初始化用户状态
  if (import.meta.client) {
    userStore.initFromStorage()
  }
  
  // 不需要登录的页面
  const publicPages = ['/login', '/register', '/couple/pair']
  const isPublicPage = publicPages.some(page => to.path.startsWith(page))
  
  // 如果未登录且访问需要登录的页面
  if (!userStore.isLoggedIn && !isPublicPage) {
    return navigateTo('/login')
  }
  
  // 如果已登录且访问登录页
  if (userStore.isLoggedIn && to.path === '/login') {
    return navigateTo('/')
  }
})
