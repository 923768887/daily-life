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
      <h1 class="text-xl font-bold text-foreground">关于我们</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>LoveDay</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-muted-foreground">
        <p>LoveDay 是一款帮助情侣记录甜蜜时光的日常应用。</p>
        <p>当前版本仍在积极开发中，感谢你的耐心与支持。</p>
        <p>如有建议，欢迎在“帮助与反馈”页面告诉我们。</p>
      </CardContent>
    </Card>
  </div>
</template>
