<script setup lang="ts">
import { ref, onMounted } from 'vue'

const hearts = ref<{ id: number; x: number; delay: number; size: number }[]>([])

onMounted(() => {
  for (let i = 0; i < 10; i++) {
    hearts.value.push({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      size: 0.5 + Math.random() * 0.5,
    })
  }
})
</script>

<template>
  <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <div
      v-for="heart in hearts"
      :key="heart.id"
      class="absolute animate-float opacity-20"
      :style="{
        left: `${heart.x}%`,
        animationDelay: `${heart.delay}s`,
        transform: `scale(${heart.size})`,
        bottom: '-50px',
      }"
    >
      <span class="text-4xl text-romantic-pink">💕</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes float-up {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.2;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

.animate-float {
  animation: float-up 15s linear infinite;
}
</style>
