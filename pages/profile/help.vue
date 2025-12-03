<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const feedback = ref('')

const handleSubmit = () => {
  if (!feedback.value.trim()) {
    alert('请填写反馈内容')
    return
  }
  alert('感谢反馈，我们会尽快处理！')
  feedback.value = ''
}
</script>

<template>
  <div class="space-y-4 animate-fade-in">
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="icon" @click="router.back()">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </Button>
      <h1 class="text-xl font-bold text-foreground">帮助与反馈</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>常见问题</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <p class="font-medium text-foreground">1. 登录出错怎么办？</p>
          <p class="text-sm text-muted-foreground">请尝试重新登录或清理浏览器缓存。</p>
        </div>
        <div>
          <p class="font-medium text-foreground">2. 数据不同步？</p>
          <p class="text-sm text-muted-foreground">请确认网络畅通，并点击页面右上角刷新按钮。</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>提交反馈</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <Textarea v-model="feedback" placeholder="请描述你的问题或建议..." />
        <Button variant="love" class="w-full" @click="handleSubmit">提交</Button>
      </CardContent>
    </Card>
  </div>
</template>
