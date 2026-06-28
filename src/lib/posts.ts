import { supabase } from "./supabase";
import type { Post, PostStatus } from "../types/post";

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

type EditableStatus = Extract<PostStatus, "draft" | "pending">;

export type PostEditorInput = {
  title: string;
  excerpt: string;
  body: string;
};

function makeBaseSlug(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || "untitled-story";
}

async function makeAvailableSlug(
  title: string,
  authorId: string,
  excludePostId?: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug")
    .eq("author_id", authorId);

  if (error) {
    throw new Error(error.message);
  }

  const existingPosts = (data ?? []) as Array<
    Pick<Post, "id" | "slug">
  >;

  const usedSlugs = new Set(
    existingPosts
      .filter((post) => post.id !== excludePostId)
      .map((post) => post.slug)
      .filter(Boolean),
  );

  const baseSlug = makeBaseSlug(title);

  let candidate = baseSlug;
  let number = 2;

  while (usedSlugs.has(candidate)) {
    candidate = `${baseSlug}-${number}`;
    number += 1;
  }

  return candidate;
}

export async function fetchMyPosts(
  authorId: string,
): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_FIELDS)
    .eq("author_id", authorId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Post[];
}

export async function fetchMyPostById(
  postId: string,
  authorId: string,
): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_FIELDS)
    .eq("id", postId)
    .eq("author_id", authorId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Post | null;
}

export async function createPost(
  authorId: string,
  input: PostEditorInput,
  status: EditableStatus,
): Promise<Post> {
  const slug = await makeAvailableSlug(input.title, authorId);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: authorId,
      title: input.title.trim(),
      slug,
      excerpt: input.excerpt.trim(),
      body: input.body.trim(),
      status,
    })
    .select(POST_FIELDS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Post;
}

export async function updatePost(
  postId: string,
  authorId: string,
  input: PostEditorInput,
  status: EditableStatus,
): Promise<Post> {
  const slug = await makeAvailableSlug(
    input.title,
    authorId,
    postId,
  );

  const { data, error } = await supabase
    .from("posts")
    .update({
      title: input.title.trim(),
      slug,
      excerpt: input.excerpt.trim(),
      body: input.body.trim(),
      status,
    })
    .eq("id", postId)
    .eq("author_id", authorId)
    .select(POST_FIELDS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Post;
}

export async function deletePost(
  postId: string,
  authorId: string,
): Promise<void> {
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("author_id", authorId);

  if (error) {
    throw new Error(error.message);
  }
}