<template>
  <div class="flex flex-col items-center justify-center min-h-[200px] gap-4">
    <div class="relative">
      <Icon 
        name="lucide:heart" 
        class="w-10 h-10 text-primary animate-pulse-soft"
      />
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin-slow" />
      </div>
    </div>
    <p class="text-sm text-muted-foreground">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>
