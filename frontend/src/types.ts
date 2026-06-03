export type Author = {
  id: number;
  name: string | null;
  email: string;
  createdAt: string;
};

export interface Post {
  id: number
  title: string
  content: string
  published: boolean
  status: string
  tags: string[]
  authorDid?: string
  authorHandle?: string
  createdAt: string
  author?: {
    name?: string
    email?: string
  }
}