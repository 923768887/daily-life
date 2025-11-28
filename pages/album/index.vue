<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import PhotoCard from '~/components/album/PhotoCard.vue'

// 模拟相册数据
const albums = ref([
  {
    id: 1,
    name: '2024春节旅行',
    description: '我们的第一次旅行',
    coverUrl: 'https://picsum.photos/400/300?random=10',
    photoCount: 50,
  },
  {
    id: 2,
    name: '日常甜蜜',
    description: '记录每一个平凡的日子',
    coverUrl: 'https://picsum.photos/400/300?random=11',
    photoCount: 128,
  },
  {
    id: 3,
    name: '美食记录',
    description: '一起吃过的美食',
    coverUrl: 'https://picsum.photos/400/300?random=12',
    photoCount: 36,
  },
])

// 模拟照片墙数据
const recentPhotos = ref([
  { id: 1, url: 'https://picsum.photos/400/400?random=1', thumbnailUrl: 'https://picsum.photos/200/200?random=1', description: '外滩夜景', location: '上海', likeCount: 5, isLiked: true },
  { id: 2, url: 'https://picsum.photos/400/600?random=2', thumbnailUrl: 'https://picsum.photos/200/300?random=2', description: '', location: '', likeCount: 3, isLiked: false },
  { id: 3, url: 'https://picsum.photos/400/400?random=3', thumbnailUrl: 'https://picsum.photos/200/200?random=3', description: '一起做饭', location: '家里', likeCount: 8, isLiked: true },
  { id: 4, url: 'https://picsum.photos/400/500?random=4', thumbnailUrl: 'https://picsum.photos/200/250?random=4', description: '', location: '', likeCount: 2, isLiked: false },
  { id: 5, url: 'https://picsum.photos/400/400?random=5', thumbnailUrl: 'https://picsum.photos/200/200?random=5', description: '周末约会', location: '咖啡厅', likeCount: 6, isLiked: true },
  { id: 6, url: 'https://picsum.photos/400/350?random=6', thumbnailUrl: 'https://picsum.photos/200/175?random=6', description: '', location: '', likeCount: 4, isLiked: false },
])

const viewMode = ref<'album' | 'wall'>('album')

const handlePhotoClick = (id: number) => {
  // TODO: 打开照片查看器
  console.log('View photo:', id)
}

const handlePhotoLike = (id: number) => {
  const photo = recentPhotos.value.find(p => p.id === id)
  if (photo) {
    photo.isLiked = !photo.isLiked
    photo.likeCount += photo.isLiked ? 1 : -1
  }
}

const handleAlbumClick = (id: number) => {
  navigateTo(`/album/${id}`)
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground flex items-center gap-2">
        <span>📸</span>
        我们的相册
      </h1>
      <NuxtLink to="/album/upload">
        <Button variant="love">
          <Icon name="lucide:upload" class="w-4 h-4" />
          上传照片
        </Button>
      </NuxtLink>
    </div>

    <!-- 视图切换 -->
    <div class="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
      <button
        class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        :class="viewMode === 'album' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'"
        @click="viewMode = 'album'"
      >
        <Icon name="lucide:folder" class="w-4 h-4 inline mr-1" />
        相册
      </button>
      <button
        class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        :class="viewMode === 'wall' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'"
        @click="viewMode = 'wall'"
      >
        <Icon name="lucide:grid-3x3" class="w-4 h-4 inline mr-1" />
        照片墙
      </button>
    </div>

    <!-- 相册视图 -->
    <div v-if="viewMode === 'album'" class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <!-- 创建新相册 -->
      <Card 
        class="cursor-pointer card-hover border-dashed border-2 hover:border-romantic-pink"
        @click="navigateTo('/album/new')"
      >
        <CardContent class="p-4 flex flex-col items-center justify-center aspect-[4/3] text-muted-foreground hover:text-romantic-pink">
          <Icon name="lucide:plus" class="w-10 h-10 mb-2" />
          <span class="text-sm">创建新相册</span>
        </CardContent>
      </Card>

      <!-- 相册列表 -->
      <Card 
        v-for="album in albums" 
        :key="album.id"
        class="cursor-pointer card-hover overflow-hidden"
        @click="handleAlbumClick(album.id)"
      >
        <div class="relative aspect-[4/3]">
          <img 
            :src="album.coverUrl" 
            :alt="album.name"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div class="absolute bottom-0 left-0 right-0 p-3 text-white">
            <h3 class="font-semibold truncate">{{ album.name }}</h3>
            <p class="text-sm opacity-80">{{ album.photoCount }} 张照片</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- 照片墙视图 -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <PhotoCard 
        v-for="photo in recentPhotos" 
        :key="photo.id"
        :photo="photo"
        @click="handlePhotoClick(photo.id)"
        @like="handlePhotoLike(photo.id)"
      />
    </div>

    <!-- 统计信息 -->
    <Card class="bg-gradient-to-r from-romantic-pink/10 to-romantic-rose/10">
      <CardContent class="p-4">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-romantic-pink">{{ albums.length }}</div>
            <div class="text-sm text-muted-foreground">个相册</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-romantic-pink">214</div>
            <div class="text-sm text-muted-foreground">张照片</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-romantic-pink">28</div>
            <div class="text-sm text-muted-foreground">个地点</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
