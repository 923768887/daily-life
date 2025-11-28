import { defineStore } from 'pinia'

interface PartnerInfo {
  id: number
  nickName: string
  coupleNickname?: string
  avatarUrl?: string
}

interface CoupleInfo {
  coupleId: number
  loveStartDate: string
  loveDays: number
  relationshipType: number
  coupleAvatar?: string
  signature?: string
  theme: string
  myInfo: PartnerInfo
  partnerInfo: PartnerInfo
}

interface CoupleState {
  coupleInfo: CoupleInfo | null
  isPaired: boolean
  isLoading: boolean
}

export const useCoupleStore = defineStore('couple', {
  state: (): CoupleState => ({
    coupleInfo: null,
    isPaired: false,
    isLoading: false,
  }),

  getters: {
    loveDays: (state) => state.coupleInfo?.loveDays ?? 0,
    loveDaysText: (state) => `相恋 ${state.coupleInfo?.loveDays ?? 0} 天`,
    loveStartDate: (state) => state.coupleInfo?.loveStartDate,
    myInfo: (state) => state.coupleInfo?.myInfo,
    partnerInfo: (state) => state.coupleInfo?.partnerInfo,
  },

  actions: {
    async fetchCoupleInfo() {
      this.isLoading = true
      try {
        const { data } = await useFetch('/api/couple/info')
        if (data.value?.code === 1000) {
          this.coupleInfo = data.value.data
          this.isPaired = true
        } else {
          this.isPaired = false
        }
      } catch (error) {
        console.error('获取情侣信息失败:', error)
      } finally {
        this.isLoading = false
      }
    },

    async generateInviteCode() {
      const { data } = await useFetch('/api/couple/invite', {
        method: 'POST',
      })
      return data.value
    },

    async pair(inviteCode: string) {
      const { data } = await useFetch('/api/couple/pair', {
        method: 'POST',
        body: { inviteCode },
      })
      
      if (data.value?.code === 1000) {
        await this.fetchCoupleInfo()
        return { success: true, data: data.value.data }
      }
      return { success: false, message: data.value?.message }
    },

    async confirmPair(coupleId: number, loveStartDate: string) {
      const { data } = await useFetch('/api/couple/confirm', {
        method: 'POST',
        body: { coupleId, loveStartDate },
      })
      
      if (data.value?.code === 1000) {
        await this.fetchCoupleInfo()
        return true
      }
      return false
    },

    reset() {
      this.coupleInfo = null
      this.isPaired = false
    },
  },
})
