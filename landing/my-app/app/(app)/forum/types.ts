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

export type PostCategory = 'All' | 'Q&A' | 'Experience' | 'Discussion';

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
