<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()

const badgeGroups = [
  {
    title: '恋爱成长',
    items: [
      { icon: '💖', name: '初恋甜蜜', desc: '完成情侣配对' },
      { icon: '💍', name: '永恒誓言', desc: '恋爱满 365 天' },
    ],
  },
  {
    title: '积极互动',
    items: [
      { icon: '📝', name: '记录达人', desc: '发布 20 篇恋爱日记' },
      { icon: '📸', name: '甜蜜摄影师', desc: '上传 50 张情侣照片' },
    ],
  },
]
</script>

<template>
  <div class="space-y-4 animate-fade-in">
    <div class="flex items-center gap-3">
      <Button variant="ghost" size="icon" @click="router.back()">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </Button>
      <h1 class="text-xl font-bold text-foreground">我的徽章</h1>
    </div>

    <Card v-for="group in badgeGroups" :key="group.title">
      <CardHeader>
        <CardTitle class="text-base flex items-center gap-2">
          <Icon name="lucide:medal" class="w-4 h-4 text-romantic-pink" />
          {{ group.title }}
        </CardTitle>
      </CardHeader>
      <CardContent class="grid gap-4">
        <div
          v-for="badge in group.items"
          :key="badge.name"
          class="flex items-center gap-4"
        >
          <div class="w-12 h-12 rounded-full bg-romantic-blush flex items-center justify-center text-2xl">
            {{ badge.icon }}
          </div>
          <div class="flex-1">
            <p class="font-medium text-foreground">{{ badge.name }}</p>
            <p class="text-sm text-muted-foreground">{{ badge.desc }}</p>
          </div>
          <Badge variant="outline">未解锁</Badge>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
