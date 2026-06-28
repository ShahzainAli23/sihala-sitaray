export type PostStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected";

export type Post = {
  id: string;
  author_id: string;

  title: string;
  slug: string;
  excerpt: string;
  body: string;

  status: PostStatus;
  published_at: string | null;

  created_at: string;
  updated_at: string;
};