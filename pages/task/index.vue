<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
</script>

<template>
  <div class="space-y-4 animate-fade-in">
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="icon" @click="router.back()">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </Button>
      <h1 class="text-xl font-bold text-foreground">每日任务</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>模块恢复中</CardTitle>
      </CardHeader>
      <CardContent class="text-muted-foreground">
        每日任务模块正在逐步恢复，当前页面仅作为路由占位，稍后会补充完整功能。
      </CardContent>
    </Card>
  </div>
</template>
