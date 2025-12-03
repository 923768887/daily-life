<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
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
      <h1 class="text-xl font-bold text-foreground">消息通知</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>功能开发中</CardTitle>
      </CardHeader>
      <CardContent class="text-muted-foreground">
        消息通知模块暂未完成，这里先作为路由占位，防止前端导航报错。
      </CardContent>
    </Card>
  </div>
</template>
