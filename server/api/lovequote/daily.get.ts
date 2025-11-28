import { db, loveQuotes } from '~/server/database'
import { success } from '~/server/utils/response'

// 默认情话列表
const defaultQuotes = [
  { content: '世界上最美好的事情，就是每天醒来都能看到你的笑容。', author: '情话集' },
  { content: '我想把世界上最好的都给你，却发现世界上最好的就是你。', author: '情话集' },
  { content: '遇见你之前，我没想过结婚；遇见你之后，我没想过别人。', author: '情话集' },
  { content: '你是我的今天，以及所有的明天。', author: '情话集' },
  { content: '我爱你，不是因为你是谁，而是因为和你在一起时我是谁。', author: '情话集' },
  { content: '余生很长，我想和你一起走。', author: '情话集' },
  { content: '你的名字是我听过最美的情话。', author: '情话集' },
  { content: '我想和你一起慢慢变老。', author: '情话集' },
  { content: '有你的日子，每一天都是情人节。', author: '情话集' },
  { content: '你是我这一生等了半世未拆的礼物。', author: '情话集' },
]

export default defineEventHandler(async () => {
  try {
    // 尝试从数据库获取
    const quotes = await db.query.loveQuotes.findMany({ limit: 100 })

    let quote
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    
    if (quotes.length > 0) {
      quote = quotes[dayOfYear % quotes.length]
    } else {
      quote = defaultQuotes[dayOfYear % defaultQuotes.length]
    }

    return success({
      content: quote.content,
      author: quote.author || '情话集',
    })
  } catch {
    // 出错时使用默认情话
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    const quote = defaultQuotes[dayOfYear % defaultQuotes.length]
    return success(quote)
  }
})
