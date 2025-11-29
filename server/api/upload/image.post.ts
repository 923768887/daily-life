import { success, error, ResponseCode } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

// 注意：在 Serverless 环境（如 Vercel/Netlify）中，文件系统是只读的
// 生产环境应使用云存储服务（如 Cloudflare R2、AWS S3、阿里云 OSS 等）
// 这里提供一个基础实现，本地开发可用

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

    // 检查是否在 Serverless 环境
    const isServerless = process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME
    
    if (isServerless) {
      // Serverless 环境：将图片转为 Base64 Data URL（临时方案）
      // 生产环境建议使用云存储服务
      for (const file of formData) {
        if (file.name === 'files' && file.data) {
          const mimeType = file.type || 'image/jpeg'
          if (!mimeType.startsWith('image/')) continue
          
          const base64 = file.data.toString('base64')
          uploadedUrls.push(`data:${mimeType};base64,${base64}`)
        }
      }
    } else {
      // 本地开发环境：保存到文件系统
      const { writeFile, mkdir } = await import('fs/promises')
      const { existsSync } = await import('fs')
      const { join } = await import('path')
      
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'images')
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      for (const file of formData) {
        if (file.name === 'files' && file.data) {
          const mimeType = file.type || ''
          if (!mimeType.startsWith('image/')) continue

          const ext = mimeType.split('/')[1] || 'jpg'
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
          const filePath = join(uploadDir, fileName)

          await writeFile(filePath, file.data)
          uploadedUrls.push(`/uploads/images/${fileName}`)
        }
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
