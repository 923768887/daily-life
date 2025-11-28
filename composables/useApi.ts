import type { ApiResponse, PaginatedData } from '~/server/utils/response'

export function useApi() {
  // 获取 token
  const getToken = () => {
    if (import.meta.client) {
      return localStorage.getItem('loveday_token')
    }
    return null
  }

  const request = async <T>(
    url: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      body?: any
      query?: Record<string, any>
    } = {}
  ): Promise<ApiResponse<T>> => {
    const { method = 'GET', body, query } = options
    const token = getToken()

    try {
      const response = await $fetch<ApiResponse<T>>(url, {
        method,
        body,
        query,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      })
      return response
    } catch (error: any) {
      console.error('API Error:', error)
      return {
        code: 5000,
        message: error.message || '请求失败',
        data: null as T,
      }
    }
  }

  return {
    // 用户相关
    login: (phone: string, code: string, loginType = 0) =>
      request<{ token: string; userInfo: any }>('/api/user/login', {
        method: 'POST',
        body: { phone, code, loginType },
      }),

    getUserInfo: () => request<any>('/api/user/info'),

    updateUserInfo: (data: any) =>
      request<any>('/api/user/info', { method: 'PUT', body: data }),

    // 情侣相关
    getCoupleInfo: () => request<any>('/api/couple/info'),

    generateInviteCode: () =>
      request<{ inviteCode: string; qrcode: string; expireTime: string }>(
        '/api/couple/invite',
        { method: 'POST' }
      ),

    pair: (inviteCode: string) =>
      request<any>('/api/couple/pair', { method: 'POST', body: { inviteCode } }),

    confirmPair: (coupleId: number, loveStartDate: string) =>
      request<any>('/api/couple/confirm', {
        method: 'POST',
        body: { coupleId, loveStartDate },
      }),

    // 日记相关
    addDiary: (data: any) =>
      request<{ id: number }>('/api/diary/add', { method: 'POST', body: data }),

    getDiaryList: (params: any) =>
      request<PaginatedData<any>>('/api/diary/page', { method: 'POST', body: params }),

    getDiaryDetail: (id: number) =>
      request<any>('/api/diary/info', { query: { id } }),

    likeDiary: (diaryId: number) =>
      request<any>('/api/diary/like', { method: 'POST', body: { diaryId } }),

    // 纪念日相关
    getAnniversaryList: () => request<{ list: any[] }>('/api/anniversary/list'),

    addAnniversary: (data: any) =>
      request<{ id: number }>('/api/anniversary/add', { method: 'POST', body: data }),

    // 每日情话
    getDailyQuote: () =>
      request<{ content: string; author: string }>('/api/lovequote/daily'),
  }
}
