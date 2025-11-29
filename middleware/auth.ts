import { useUserStore } from '~/stores/user'

export default defineNuxtRouteMiddleware((to) => {
  // 只在客户端执行
  if (import.meta.server) return
  
  const userStore = useUserStore()
  
  // 初始化并检查登录状态
  const isAuthenticated = userStore.checkAuth()
  
  // 不需要登录的页面
  const publicPages = ['/login', '/register']
  const isPublicPage = publicPages.some(page => to.path === page || to.path.startsWith(page + '/'))
  
  // 如果已登录且访问登录/注册页，跳转到首页
  if (isAuthenticated && isPublicPage) {
    return navigateTo('/', { replace: true })
  }
  
  // 如果未登录且访问需要登录的页面
  if (!isAuthenticated && !isPublicPage) {
    // 保存原始目标路径，登录后可以跳转回来
    const redirectPath = to.fullPath !== '/' ? to.fullPath : undefined
    return navigateTo({
      path: '/login',
      query: redirectPath ? { redirect: redirectPath } : undefined,
    })
  }
  
  // 已登录用户访问页面时，刷新 token 有效期（保持活跃）
  if (isAuthenticated) {
    userStore.refreshTokenExpire()
  }
})
