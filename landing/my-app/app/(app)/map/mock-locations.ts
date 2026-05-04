export interface MapLocation {
  id: string;
  name: string;
  type: 'blind' | 'volunteer' | 'business';
  lng: number;
  lat: number;
  status?: string;
  description?: string;
  phone?: string;
  jobs?: string[];
}

function randomOffset(base: number, range: number): number {
  return base + (Math.random() - 0.5) * range;
}

const CENTER_LNG = 116.397428;
const CENTER_LAT = 39.90923;

export const MOCK_LOCATIONS: MapLocation[] = [
  // 盲人/眼镜（10个）
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `blind-${i + 1}`,
    name: ['小明', '小红', '小刚', '小丽', '小华', '小芳', '小军', '小燕', '小波', '小敏'][i],
    type: 'blind' as const,
    lng: randomOffset(CENTER_LNG, 0.08),
    lat: randomOffset(CENTER_LAT, 0.08),
    status: i < 3 ? '正在求助' : '空闲',
    description: `眼镜编号：GL-2025-${String(i + 1).padStart(3, '0')}`,
  })),

  // 志愿者（20个）
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `vol-${i + 1}`,
    name: `志愿者${['小李', '小张', '小王', '小刘', '小陈', '小杨', '小黄', '小吴', '小周', '小徐', '小孙', '小马', '小朱', '小胡', '小林', '小郭', '小何', '小高', '小罗', '小郑'][i]}`,
    type: 'volunteer' as const,
    lng: randomOffset(CENTER_LNG, 0.12),
    lat: randomOffset(CENTER_LAT, 0.12),
    status: i < 15 ? '在线' : '离线',
    description: `已帮助 ${Math.floor(Math.random() * 20)} 人`,
  })),

  // 商家（8个）
  ...[
    { name: '光明便利店', jobs: ['收银员', '理货员'], phone: '138-0000-0001' },
    { name: '阳光咖啡店', jobs: ['咖啡师', '服务员'], phone: '138-0000-0002' },
    { name: '惠民超市', jobs: ['理货员', '仓库管理'], phone: '138-0000-0003' },
    { name: '温馨花店', jobs: ['花艺师'], phone: '138-0000-0004' },
    { name: '大众餐厅', jobs: ['后厨帮工', '洗碗工'], phone: '138-0000-0005' },
    { name: '社区图书馆', jobs: ['图书整理员'], phone: '138-0000-0006' },
    { name: '爱心洗衣房', jobs: ['洗衣工', '前台'], phone: '138-0000-0007' },
    { name: '手工艺品店', jobs: ['手工艺人'], phone: '138-0000-0008' },
  ].map((biz, i) => ({
    id: `biz-${i + 1}`,
    name: biz.name,
    type: 'business' as const,
    lng: randomOffset(CENTER_LNG, 0.1),
    lat: randomOffset(CENTER_LAT, 0.1),
    jobs: biz.jobs,
    phone: biz.phone,
    description: `提供岗位：${biz.jobs.join('、')}`,
  })),
];
