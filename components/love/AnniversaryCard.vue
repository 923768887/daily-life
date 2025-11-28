<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { getDaysBetween } from '~/lib/utils'

interface Anniversary {
  id: number
  title: string
  date: string
  type: string
  icon: string
  color?: string
}

const props = defineProps<{
  anniversary: Anniversary
}>()

const daysToNext = computed(() => {
  const today = new Date()
  const annDate = new Date(props.anniversary.date)
  annDate.setFullYear(today.getFullYear())
  
  if (annDate < today) {
    annDate.setFullYear(today.getFullYear() + 1)
  }
  
  return getDaysBetween(today, annDate)
})

const isToday = computed(() => daysToNext.value === 0)
const isUpcoming = computed(() => daysToNext.value <= 7 && daysToNext.value > 0)
</script>

<template>
  <Card class="card-hover overflow-hidden" :class="{ 'ring-2 ring-romantic-pink': isToday }">
    <CardContent class="p-4">
      <div class="flex items-start gap-3">
        <div 
          class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          :style="{ backgroundColor: anniversary.color || '#FFE4E9' }"
        >
          {{ anniversary.icon }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-foreground truncate">{{ anniversary.title }}</h3>
            <Badge v-if="isToday" variant="love" class="shrink-0">今天</Badge>
            <Badge v-else-if="isUpcoming" variant="secondary" class="shrink-0">即将到来</Badge>
          </div>
          <p class="text-sm text-muted-foreground mt-1">{{ anniversary.date }}</p>
          <p v-if="!isToday" class="text-sm text-romantic-pink mt-1">
            还有 {{ daysToNext }} 天
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
