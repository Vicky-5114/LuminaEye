export type UserRole = 'blind' | 'volunteer';

export interface ForumUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface Comment {
  id: string;
  author: ForumUser;
  content: string;
  createdAt: string;
}

export type PostCategory = '全部' | '求助问答' | '经验分享' | '社区讨论';

export interface Post {
  id: string;
  title: string;
  author: ForumUser;
  category: PostCategory;
  summary: string;
  content: string;
  comments: Comment[];
  likes: number;
  createdAt: string;
}
