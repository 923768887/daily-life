<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-romantic-blush flex flex-col">
    <!-- 背景装饰 -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-romantic-pink/20 rounded-full blur-3xl" />
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-romantic-rose/20 rounded-full blur-3xl" />
    </div>

    <!-- Logo -->
    <div class="flex items-center justify-center pt-12 pb-6">
      <div class="flex flex-col items-center gap-2">
        <span class="text-5xl animate-heart-beat">💕</span>
        <span class="font-bold text-3xl love-gradient-text">Lovory</span>
        <span class="text-muted-foreground text-sm">记录你们的美好时光</span>
      </div>
    </div>

    <!-- 内容区 -->
    <main class="flex-1 container px-4 py-6 relative z-10">
      <slot />
    </main>

    <!-- 底部 -->
    <footer class="py-4 text-center text-sm text-muted-foreground">
      <p>© 2025 Lovory. Made with ldh</p>
    </footer>
  </div>
</template>
