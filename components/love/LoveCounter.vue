<script setup lang="ts">
import { computed } from 'vue'
import { getDaysBetween } from '~/lib/utils'

const props = defineProps<{
  startDate: string | Date
}>()

const loveDays = computed(() => getDaysBetween(props.startDate))
</script>

<template>
  <div class="flex flex-col items-center justify-center p-6 rounded-2xl love-gradient text-white">
    <div class="text-lg opacity-90 mb-2">我们已经相爱</div>
    <div class="flex items-baseline gap-1">
      <span class="text-5xl font-bold animate-heart-beat">{{ loveDays }}</span>
      <span class="text-xl">天</span>
    </div>
    <div class="mt-3 flex items-center gap-2 text-sm opacity-80">
      <span>💕</span>
      <span>每一天都是爱你的日子</span>
      <span>💕</span>
    </div>
  </div>
</template>
