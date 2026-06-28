import { supabase } from "./supabase";

import type { Post, PostStatus } from "../types/post";
import type { Profile } from "../types/profile";

const POST_FIELDS = `
  id,
  author_id,
  title,
  slug,
  excerpt,
  body,
  status,
  published_at,
  created_at,
  updated_at
`;

type AuthorSummary = Pick<
  Profile,
  "id" | "username" | "display_name" | "page_title"
>;

export type ModerationPost = Post & {
  author: AuthorSummary | null;
};

type ModerationStatus = Extract<
  PostStatus,
  "published" | "rejected"
>;

export async function fetchPendingPosts(): Promise<ModerationPost[]> {
  const { data: pendingPostsData, error: postsError } = await supabase
    .from("posts")
    .select(POST_FIELDS)
    .eq("status", "pending")
    .order("updated_at", { ascending: false });

  if (postsError) {
    throw new Error(postsError.message);
  }

  const pendingPosts = (pendingPostsData ?? []) as Post[];

  if (pendingPosts.length === 0) {
    return [];
  }

  const authorIds = [
    ...new Set(pendingPosts.map((post) => post.author_id)),
  ];

  const { data: authorsData, error: authorsError } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      page_title
    `)
    .in("id", authorIds);

  if (authorsError) {
    throw new Error(authorsError.message);
  }

  const authors = (authorsData ?? []) as AuthorSummary[];

  const authorsById = new Map(
    authors.map((author) => [author.id, author]),
  );

  return pendingPosts.map((post) => ({
    ...post,
    author: authorsById.get(post.author_id) ?? null,
  }));
}

export async function updatePostModerationStatus(
  postId: string,
  status: ModerationStatus,
): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .update({ status })
    .eq("id", postId)
    .select(POST_FIELDS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Post;
}