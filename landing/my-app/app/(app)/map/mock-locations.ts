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
  // Blind users / glasses (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `blind-${i + 1}`,
    name: ['Ming', 'Hong', 'Gang', 'Li', 'Hua', 'Fang', 'Jun', 'Yan', 'Bo', 'Min'][i],
    type: 'blind' as const,
    lng: randomOffset(CENTER_LNG, 0.08),
    lat: randomOffset(CENTER_LAT, 0.08),
    status: i < 3 ? 'Requesting Help' : 'Idle',
    description: `Glasses ID: GL-2025-${String(i + 1).padStart(3, '0')}`,
  })),

  // Volunteers (20)
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `vol-${i + 1}`,
    name: `Volunteer ${['Lee', 'Zhang', 'Wang', 'Liu', 'Chen', 'Yang', 'Huang', 'Wu', 'Zhou', 'Xu', 'Sun', 'Ma', 'Zhu', 'Hu', 'Lin', 'Guo', 'He', 'Gao', 'Luo', 'Zheng'][i]}`,
    type: 'volunteer' as const,
    lng: randomOffset(CENTER_LNG, 0.12),
    lat: randomOffset(CENTER_LAT, 0.12),
    status: i < 15 ? 'Online' : 'Offline',
    description: `Helped ${Math.floor(Math.random() * 20)} people`,
  })),

  // Businesses (8)
  ...[
    { name: 'Bright Convenience Store', jobs: ['Cashier', 'Stock Clerk'], phone: '138-0000-0001' },
    { name: 'Sunshine Coffee Shop', jobs: ['Barista', 'Server'], phone: '138-0000-0002' },
    { name: 'Huimin Supermarket', jobs: ['Stock Clerk', 'Warehouse Manager'], phone: '138-0000-0003' },
    { name: 'Cozy Flower Shop', jobs: ['Florist'], phone: '138-0000-0004' },
    { name: 'Popular Restaurant', jobs: ['Kitchen Helper', 'Dishwasher'], phone: '138-0000-0005' },
    { name: 'Community Library', jobs: ['Book Organizer'], phone: '138-0000-0006' },
    { name: 'Caring Laundry', jobs: ['Laundry Worker', 'Receptionist'], phone: '138-0000-0007' },
    { name: 'Handicraft Store', jobs: ['Artisan'], phone: '138-0000-0008' },
  ].map((biz, i) => ({
    id: `biz-${i + 1}`,
    name: biz.name,
    type: 'business' as const,
    lng: randomOffset(CENTER_LNG, 0.1),
    lat: randomOffset(CENTER_LAT, 0.1),
    jobs: biz.jobs,
    phone: biz.phone,
    description: `Jobs: ${biz.jobs.join(', ')}`,
  })),
];
