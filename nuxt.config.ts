// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
  ],

  css: ['~/assets/css/main.css'],

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  components: {
    dirs: [
      {
        path: '~/components',
        // 忽略 index.ts 文件，避免组件名称冲突
        ignore: ['**/index.ts'],
      },
      {
        path: '~/components/ui',
        // ui 目录下的组件不加前缀
        pathPrefix: false,
        ignore: ['**/index.ts'],
      },
    ],
  },

  app: {
    head: {
      title: 'Lovory - 情侣记忆管理',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Lovory - 记录你们的美好时光' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },

  routeRules: {
    '/': { ssr: false },
    '/diary/**': { ssr: false },
    '/album/**': { ssr: false },
    '/anniversary/**': { ssr: false },
    '/schedule/**': { ssr: false },
    '/profile/**': { ssr: false },
    '/message/**': { ssr: false },
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'loveday-secret-key',
    public: {
      apiBase: '/api',
    },
  },

  nitro: {
    experimental: {
      asyncContext: true,
    },
  },
})
