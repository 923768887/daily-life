export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T | null
}

export interface PaginatedData<T> {
  list: T[]
  pagination: {
    page: number
    size: number
    total: number
  }
}

export const ResponseCode = {
  SUCCESS: 0,
  PARAM_ERROR: 1001,
  UNAUTHORIZED: 1002,
  FORBIDDEN: 1003,
  NOT_FOUND: 1004,
  OPERATION_FAILED: 1005,
  RATE_LIMIT: 1006,
  SERVER_ERROR: 5000,
  NOT_PAIRED: 2001,
  ALREADY_PAIRED: 2002,
  INVALID_INVITE_CODE: 2003,
  INVITE_CODE_EXPIRED: 2004,
}

export function success<T>(data: T, message = 'success'): ApiResponse<T> {
  return {
    code: ResponseCode.SUCCESS,
    message,
    data,
  }
}

export function error(code: number, message: string): ApiResponse<null> {
  return {
    code,
    message,
    data: null,
  }
}

export function paginated<T>(
  list: T[],
  page: number,
  size: number,
  total: number
): ApiResponse<PaginatedData<T>> {
  return {
    code: ResponseCode.SUCCESS,
    message: 'success',
    data: {
      list,
      pagination: { page, size, total },
    },
  }
}

export function formatDateTime(date: Date = new Date()): string {
  return date.toISOString().replace('T', ' ').substring(0, 19)
}
