import { success, error, ResponseCode } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  try {
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      return error(ResponseCode.PARAM_ERROR, '请选择图片')
    }

    const uploadedUrls: string[] = []
    
    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'images')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    for (const file of formData) {
      if (file.name === 'files' && file.data) {
        // 验证文件类型
        const mimeType = file.type || ''
        if (!mimeType.startsWith('image/')) {
          continue
        }

        // 生成唯一文件名
        const ext = mimeType.split('/')[1] || 'jpg'
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
        const filePath = join(uploadDir, fileName)

        // 保存文件
        await writeFile(filePath, file.data)

        // 返回可访问的 URL
        uploadedUrls.push(`/uploads/images/${fileName}`)
      }
    }

    if (uploadedUrls.length === 0) {
      return error(ResponseCode.PARAM_ERROR, '没有有效的图片文件')
    }

    return success({
      urls: uploadedUrls,
    })
  } catch (e: any) {
    console.error('图片上传失败:', e)
    return error(ResponseCode.ERROR, '图片上传失败')
  }
})
