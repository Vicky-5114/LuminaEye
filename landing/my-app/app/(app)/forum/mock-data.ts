import { Post } from './types';

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: '求助：如何过没有红绿灯的斑马线？',
    author: { id: 'b1', name: '小明', role: 'blind' },
    category: '求助问答',
    summary: '家附近有一条没有红绿灯的斑马线，车流量很大，想请教大家有什么安全过马路的技巧？',
    content: '家附近有一条没有红绿灯的斑马线，车流量很大，每次过马路都很紧张。想请教大家有什么安全过马路的技巧？尤其是如何判断车距和车速。',
    comments: [
      { id: 'c1', author: { id: 'v1', name: '志愿者小李', role: 'volunteer' }, content: '建议先侧耳倾听，确认没有车辆接近时再快速通过。如果有志愿者陪同最好。', createdAt: '2026-05-04 10:00' },
      { id: 'c2', author: { id: 'b2', name: '小红', role: 'blind' }, content: '我一般是举手示意，很多司机看到会主动减速。', createdAt: '2026-05-04 11:30' },
    ],
    likes: 12,
    createdAt: '2026-05-04 09:00',
  },
  {
    id: '2',
    title: '分享：今天帮助了3位朋友过马路',
    author: { id: 'v1', name: '志愿者小李', role: 'volunteer' },
    category: '经验分享',
    summary: '今天在朝阳区做志愿者，帮助了3位盲人朋友安全通过斑马线，很有成就感！',
    content: '今天在朝阳区做志愿者，帮助了3位盲人朋友安全通过斑马线。其中一位是张大爷，他告诉我用了 LuminaEye 眼镜后出行方便多了。看到大家能独立出行，真的很开心！',
    comments: [
      { id: 'c3', author: { id: 'b3', name: '小刚', role: 'blind' }, content: '感谢您们的付出！', createdAt: '2026-05-04 14:00' },
    ],
    likes: 23,
    createdAt: '2026-05-04 08:00',
  },
  {
    id: '3',
    title: '讨论：大家最常用的导航模式是什么？',
    author: { id: 'v2', name: '志愿者小张', role: 'volunteer' },
    category: '社区讨论',
    summary: '想了解一下大家平时用 LuminaEye 时，哪个导航模式最常用？',
    content: '想了解一下大家平时用 LuminaEye 时，哪个导航模式最常用？是盲道导航、过马路辅助，还是物品搜索？',
    comments: [
      { id: 'c4', author: { id: 'b1', name: '小明', role: 'blind' }, content: '我最喜欢盲道导航，去公园的时候很有用。', createdAt: '2026-05-03 16:00' },
      { id: 'c5', author: { id: 'b2', name: '小红', role: 'blind' }, content: '物品搜索找东西很方便，特别是找水杯和钥匙。', createdAt: '2026-05-03 17:00' },
    ],
    likes: 8,
    createdAt: '2026-05-03 15:00',
  },
  {
    id: '4',
    title: '求助：眼镜突然连不上网络了怎么办？',
    author: { id: 'b2', name: '小红', role: 'blind' },
    category: '求助问答',
    summary: '今天出门发现眼镜连不上 WiFi 了，重置了也不行，有人遇到过吗？',
    content: '今天出门发现眼镜连不上 WiFi 了，长按重置键也不管用。有人遇到过类似问题吗？怎么解决的？',
    comments: [
      { id: 'c6', author: { id: 'v3', name: '志愿者小王', role: 'volunteer' }, content: '试试检查一下家里的路由器，或者联系管理员重置眼镜配置。', createdAt: '2026-05-02 20:00' },
    ],
    likes: 5,
    createdAt: '2026-05-02 18:00',
  },
  {
    id: '5',
    title: '分享：第一次独立完成购物',
    author: { id: 'b3', name: '小刚', role: 'blind' },
    category: '经验分享',
    summary: '今天用 LuminaEye 去超市买了牛奶和面包，全程没有求助，太开心了！',
    content: '今天用 LuminaEye 去超市买了牛奶和面包，物品搜索功能帮了大忙！全程没有求助志愿者，感觉自己越来越独立了。',
    comments: [
      { id: 'c7', author: { id: 'v1', name: '志愿者小李', role: 'volunteer' }, content: '太棒了！为你骄傲！', createdAt: '2026-05-01 12:00' },
      { id: 'c8', author: { id: 'b1', name: '小明', role: 'blind' }, content: '恭喜！我也想去试试。', createdAt: '2026-05-01 13:00' },
    ],
    likes: 31,
    createdAt: '2026-05-01 10:00',
  },
];

export const ALL_CATEGORIES = ['全部', '求助问答', '经验分享', '社区讨论'] as const;
