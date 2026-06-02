export type Author = {
  id: number;
  name: string | null;
  email: string;
  createdAt: string;
};

export type Post = {
  id: number;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
  author: Author | null;
};