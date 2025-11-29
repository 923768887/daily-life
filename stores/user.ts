import { defineStore } from 'pinia'

interface UserInfo {
  id: number
  phone: string
  nickName: string
  avatarUrl?: string
  gender?: number
  birthday?: string
  constellation?: string
  hobby?: string
  isPaired: boolean
  coupleId?: number
}

interface UserState {
  token: string | null
  tokenExpireAt: number | null  // token 过期时间戳
  userInfo: UserInfo | null
  isLoggedIn: boolean
}

// Token 有效期（7天，单位毫秒）
const TOKEN_EXPIRE_DURATION = 7 * 24 * 60 * 60 * 1000

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: null,
    tokenExpireAt: null,
    userInfo: null,
    isLoggedIn: false,
  }),

  getters: {
    userId: (state) => state.userInfo?.id,
    isPaired: (state) => state.userInfo?.isPaired ?? false,
    // 检查 token 是否有效（未过期）
    isTokenValid: (state) => {
      if (!state.token || !state.tokenExpireAt) return false
      return Date.now() < state.tokenExpireAt
    },
  },

  actions: {
    setToken(token: string, expireAt?: number) {
      this.token = token
      this.tokenExpireAt = expireAt || Date.now() + TOKEN_EXPIRE_DURATION
      this.isLoggedIn = true
      if (import.meta.client) {
        localStorage.setItem('loveday_token', token)
        localStorage.setItem('loveday_token_expire', String(this.tokenExpireAt))
      }
    },

    setUserInfo(info: UserInfo) {
      this.userInfo = info
      if (import.meta.client) {
        localStorage.setItem('loveday_user', JSON.stringify(info))
      }
    },

    async login(phone: string, code: string, loginType: number = 0, password?: string) {
      try {
        const response = await $fetch<any>('/api/user/login', {
          method: 'POST',
          body: { phone, code, password, loginType },
        })

        if (response?.code === 0) {
          this.setToken(response.data.token)
          this.setUserInfo(response.data.userInfo)
          return { success: true }
        }
        return { success: false, message: response?.message || '登录失败' }
      } catch (error: any) {
        return { success: false, message: error.message || '网络错误' }
      }
    },

    async fetchUserInfo() {
      try {
        const response = await $fetch<any>('/api/user/info')
        if (response?.code === 0) {
          this.setUserInfo(response.data)
          return true
        }
        return false
      } catch {
        return false
      }
    },

    logout() {
      this.token = null
      this.tokenExpireAt = null
      this.userInfo = null
      this.isLoggedIn = false
      if (import.meta.client) {
        localStorage.removeItem('loveday_token')
        localStorage.removeItem('loveday_token_expire')
        localStorage.removeItem('loveday_user')
      }
    },

    // 从本地存储初始化状态
    initFromStorage() {
      if (import.meta.client) {
        const token = localStorage.getItem('loveday_token')
        const expireStr = localStorage.getItem('loveday_token_expire')
        const userStr = localStorage.getItem('loveday_user')
        
        if (token && expireStr) {
          const expireAt = parseInt(expireStr, 10)
          
          // 检查 token 是否过期
          if (Date.now() < expireAt) {
            this.token = token
            this.tokenExpireAt = expireAt
            this.isLoggedIn = true
            
            if (userStr) {
              try {
                this.userInfo = JSON.parse(userStr)
              } catch {}
            }
          } else {
            // Token 已过期，清除登录状态
            this.logout()
          }
        }
      }
    },

    // 检查登录状态是否有效
    checkAuth(): boolean {
      this.initFromStorage()
      return this.isLoggedIn && this.isTokenValid
    },

    // 刷新 token 有效期（用于活跃用户延长登录时间）
    refreshTokenExpire() {
      if (this.token && this.isLoggedIn) {
        this.tokenExpireAt = Date.now() + TOKEN_EXPIRE_DURATION
        if (import.meta.client) {
          localStorage.setItem('loveday_token_expire', String(this.tokenExpireAt))
        }
      }
    },
  },
})
