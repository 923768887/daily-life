<template>
  <div 
    class="skeleton rounded-md"
    :class="[sizeClass]"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string
  height?: string
}>()

const sizeClass = computed(() => {
  switch (props.variant) {
    case 'circular':
      return 'w-10 h-10 rounded-full'
    case 'card':
      return 'w-full h-32'
    case 'text':
      return 'w-full h-4'
    default:
      return ''
  }
})
</script>
