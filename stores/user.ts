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
  userInfo: UserInfo | null
  isLoggedIn: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: null,
    userInfo: null,
    isLoggedIn: false,
  }),

  getters: {
    userId: (state) => state.userInfo?.id,
    isPaired: (state) => state.userInfo?.isPaired ?? false,
  },

  actions: {
    setToken(token: string) {
      this.token = token
      this.isLoggedIn = true
      if (import.meta.client) {
        localStorage.setItem('loveday_token', token)
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
      this.userInfo = null
      this.isLoggedIn = false
      if (import.meta.client) {
        localStorage.removeItem('loveday_token')
        localStorage.removeItem('loveday_user')
      }
    },

    initFromStorage() {
      if (import.meta.client) {
        const token = localStorage.getItem('loveday_token')
        const userStr = localStorage.getItem('loveday_user')
        if (token) {
          this.token = token
          this.isLoggedIn = true
          if (userStr) {
            try {
              this.userInfo = JSON.parse(userStr)
            } catch {}
          }
        }
      }
    },
  },
})
