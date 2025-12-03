# 💕 Lovory - 情侣记忆管理应用

基于 Nuxt 3 的全栈情侣记忆管理应用，帮助情侣记录、分享和回顾美好时光。

## 技术栈

- **框架**: Nuxt 3
- **UI**: TailwindCSS + shadcn-vue
- **状态管理**: Pinia
- **数据库**: SQLite + Drizzle ORM
- **图标**: Lucide Icons
- **工具库**: VueUse, date-fns

## 功能特性

### 核心功能
- 👫 **情侣配对** - 邀请码/二维码配对
- 📖 **日记系统** - 记录每日点滴，支持心情、天气、位置
- 📸 **相册管理** - 照片墙、相册分类
- 🎉 **纪念日** - 重要日期提醒与回顾
- 📅 **日程管理** - 共享日程与提醒

### 特色功能
- ✨ **每日任务** - 签到、早安晚安
- 💌 **每日情话** - 浪漫情话推送
- 🏅 **成就徽章** - 互动奖励系统
- 🗺️ **足迹地图** - 记录共同去过的地方

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 初始化数据库

```bash
pnpm db:push
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
pnpm build
```

## 项目结构

```
nuxt-daily-life/
├── assets/              # 静态资源
│   └── css/             # 样式文件
├── components/          # 组件
│   ├── ui/              # shadcn-vue 基础组件
│   ├── love/            # 情侣相关组件
│   ├── diary/           # 日记组件
│   └── album/           # 相册组件
├── composables/         # 组合式函数
├── layouts/             # 布局
├── lib/                 # 工具库
├── pages/               # 页面
├── server/              # 服务端
│   ├── api/             # API 路由
│   ├── database/        # 数据库
│   └── utils/           # 服务端工具
├── stores/              # Pinia 状态管理
├── types/               # TypeScript 类型
└── public/              # 公共资源
```

## API 接口

### 用户模块
- `POST /api/user/login` - 登录
- `GET /api/user/info` - 获取用户信息

### 情侣模块
- `POST /api/couple/invite` - 生成邀请码
- `POST /api/couple/pair` - 配对
- `GET /api/couple/info` - 获取情侣信息

### 日记模块
- `POST /api/diary/add` - 创建日记
- `POST /api/diary/page` - 日记列表

### 纪念日模块
- `GET /api/anniversary/list` - 纪念日列表
- `POST /api/anniversary/add` - 添加纪念日

## 主题配色

应用采用浪漫粉色主题：

- **Primary**: #FF3366 (玫红)
- **Secondary**: #FFB6C1 (浅粉)
- **Background**: #FFF5F7 (淡粉)
- **Accent**: #FF1493 (深粉)

## 开发计划

- [x] 项目初始化
- [x] 基础 UI 组件
- [x] 用户认证
- [x] 情侣配对
- [x] 日记功能
- [x] 相册功能
- [x] 纪念日功能
- [ ] 日程管理
- [ ] 消息系统
- [ ] 任务系统
- [ ] 数据统计

## 仓库说明（Gitee + GitHub 双远程）

本项目采用「Gitee 为主仓库，GitHub 为镜像」的工作流：

- 主仓库（国内开发、CI 优先使用）  
  - Gitee：`https://gitee.com/FengYe_Li/daily-life.git`
  - 远程名：`origin`

- 镜像仓库（给 GitHub / Vercel / 开源使用）  
  - GitHub：`https://github.com/923768887/daily-life.git`
  - 远程名：`github`

### 本地远程配置

```bash
# 查看当前远程
git remote -v
# 期望看到：
# origin  [https://gitee.com/FengYe_Li/daily-life.git](https://gitee.com/FengYe_Li/daily-life.git) (fetch)
# origin  [https://gitee.com/FengYe_Li/daily-life.git](https://gitee.com/FengYe_Li/daily-life.git) (push)
# github  [https://github.com/923768887/daily-life.git](https://github.com/923768887/daily-life.git) (fetch)
# github  [https://github.com/923768887/daily-life.git](https://github.com/923768887/daily-life.git) (push)

## 许可证

MIT License

---

Made with ❤️ by Lovory Team
