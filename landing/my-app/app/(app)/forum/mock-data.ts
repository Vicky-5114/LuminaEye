import { Post } from './types';

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'Help: How to cross a zebra crossing without traffic lights?',
    author: { id: 'b1', name: 'Ming', role: 'blind' },
    category: 'Q&A',
    summary: 'There is a zebra crossing near my home without traffic lights and heavy traffic. Any tips for safe crossing?',
    content: 'There is a zebra crossing near my home without traffic lights and heavy traffic. I get nervous every time I cross. Any tips for safe crossing? Especially how to judge vehicle distance and speed.',
    comments: [
      { id: 'c1', author: { id: 'v1', name: 'Volunteer Lee', role: 'volunteer' }, content: 'I suggest listening carefully first, and crossing quickly only when no vehicles are approaching. Best to have a volunteer accompany you.', createdAt: '2026-05-04 10:00' },
      { id: 'c2', author: { id: 'b2', name: 'Hong', role: 'blind' }, content: 'I usually raise my hand to signal, and many drivers will slow down when they see me.', createdAt: '2026-05-04 11:30' },
    ],
    likes: 12,
    createdAt: '2026-05-04 09:00',
  },
  {
    id: '2',
    title: 'Share: Helped 3 friends cross the street today',
    author: { id: 'v1', name: 'Volunteer Lee', role: 'volunteer' },
    category: 'Experience',
    summary: 'Volunteered in Chaoyang District today, helped 3 blind friends safely cross the zebra crossing. Very fulfilling!',
    content: 'Volunteered in Chaoyang District today, helped 3 blind friends safely cross the zebra crossing. One of them was Uncle Zhang, who told me that LuminaEye glasses have made his travels much easier. Seeing everyone become more independent is truly heartwarming!',
    comments: [
      { id: 'c3', author: { id: 'b3', name: 'Gang', role: 'blind' }, content: 'Thank you for your dedication!', createdAt: '2026-05-04 14:00' },
    ],
    likes: 23,
    createdAt: '2026-05-04 08:00',
  },
  {
    id: '3',
    title: 'Discussion: What navigation mode do you use most?',
    author: { id: 'v2', name: 'Volunteer Zhang', role: 'volunteer' },
    category: 'Discussion',
    summary: 'Would like to know which navigation mode everyone uses most often with LuminaEye?',
    content: 'Would like to know which navigation mode everyone uses most often with LuminaEye? Is it blind path navigation, street crossing assist, or item search?',
    comments: [
      { id: 'c4', author: { id: 'b1', name: 'Ming', role: 'blind' }, content: 'I like blind path navigation the most, very useful when going to the park.', createdAt: '2026-05-03 16:00' },
      { id: 'c5', author: { id: 'b2', name: 'Hong', role: 'blind' }, content: 'Item search is very convenient for finding things, especially water bottles and keys.', createdAt: '2026-05-03 17:00' },
    ],
    likes: 8,
    createdAt: '2026-05-03 15:00',
  },
  {
    id: '4',
    title: 'Help: Glasses suddenly cannot connect to WiFi',
    author: { id: 'b2', name: 'Hong', role: 'blind' },
    category: 'Q&A',
    summary: 'Went out today and found the glasses could not connect to WiFi. Reset did not work. Anyone else experienced this?',
    content: 'Went out today and found the glasses could not connect to WiFi. Long-pressed the reset button and it did not help. Has anyone experienced similar issues? How did you solve it?',
    comments: [
      { id: 'c6', author: { id: 'v3', name: 'Volunteer Wang', role: 'volunteer' }, content: 'Try checking your home router, or contact the admin to reset the glasses configuration.', createdAt: '2026-05-02 20:00' },
    ],
    likes: 5,
    createdAt: '2026-05-02 18:00',
  },
  {
    id: '5',
    title: 'Share: First time shopping independently',
    author: { id: 'b3', name: 'Gang', role: 'blind' },
    category: 'Experience',
    summary: 'Used LuminaEye to buy milk and bread at the supermarket today, no help needed the whole time. So happy!',
    content: 'Used LuminaEye to buy milk and bread at the supermarket today, the item search feature was a huge help! No help needed from volunteers the whole time. Feeling more and more independent.',
    comments: [
      { id: 'c7', author: { id: 'v1', name: 'Volunteer Lee', role: 'volunteer' }, content: 'Amazing! So proud of you!', createdAt: '2026-05-01 12:00' },
      { id: 'c8', author: { id: 'b1', name: 'Ming', role: 'blind' }, content: 'Congrats! I want to try too.', createdAt: '2026-05-01 13:00' },
    ],
    likes: 31,
    createdAt: '2026-05-01 10:00',
  },
];

export const ALL_CATEGORIES = ['All', 'Q&A', 'Experience', 'Discussion'] as const;
