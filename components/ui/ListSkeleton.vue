<template>
  <div class="space-y-4">
    <CardSkeleton v-for="i in count" :key="i" :show-image="showImage" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  count?: number
  showImage?: boolean
}>()
</script>
