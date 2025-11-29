import { useUserStore } from '~/stores/user'

export default defineNuxtPlugin(() => {
  const userStore = useUserStore()
  
  // 初始化登录状态（包含过期检查）
  userStore.initFromStorage()
  
  // 如果已登录，刷新 token 有效期
  if (userStore.isLoggedIn) {
    userStore.refreshTokenExpire()
  }
})
