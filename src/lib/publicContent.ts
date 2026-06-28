import { supabase } from "./supabase";
import { getSignedStorageUrls } from "./storageUrls";

import type { Post } from "../types/post";
import type {
  PostMedia,
  PostMediaWithUrl,
} from "../types/postMedia";
import type { Profile } from "../types/profile";

const PUBLIC_POST_FIELDS = `
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

const PUBLIC_MEDIA_FIELDS = `
  id,
  post_id,
  uploaded_by,
  storage_path,
  media_type,
  alt_text,
  caption,
  show_in_post,
  show_in_gallery,
  placement,
  after_paragraph,
  sort_order,
  created_at
`;

type GalleryPost = Pick<
  Post,
  "id" | "author_id" | "title" | "slug" | "published_at" | "created_at"
>;

type GalleryAuthor = Pick<
  Profile,
  "id" | "username" | "display_name" | "page_title"
>;

export type GalleryItem = {
  media: PostMediaWithUrl;
  post: GalleryPost;
  author: GalleryAuthor;
};

async function attachSignedUrls(
  media: PostMedia[],
): Promise<PostMediaWithUrl[]> {
  const urlMap = await getSignedStorageUrls(
    media.map((item) => item.storage_path),
  );

  return media.map((item) => ({
    ...item,
    signed_url: urlMap.get(item.storage_path) ?? null,
  }));
}

export async function fetchPublishedPostsForAuthor(
  authorId: string,
): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(PUBLIC_POST_FIELDS)
    .eq("author_id", authorId)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Post[];
}

export async function fetchPublishedPostBySlug(
  authorId: string,
  slug: string,
): Promise<Post | null> {
  const normalizedSlug = slug.trim().toLowerCase();

  if (!normalizedSlug) {
    return null;
  }

  const { data, error } = await supabase
    .from("posts")
    .select(PUBLIC_POST_FIELDS)
    .eq("author_id", authorId)
    .eq("slug", normalizedSlug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Post | null;
}

export async function fetchPublishedPostMedia(
  postId: string,
): Promise<PostMediaWithUrl[]> {
  const { data, error } = await supabase
    .from("post_media")
    .select(PUBLIC_MEDIA_FIELDS)
    .eq("post_id", postId)
    .eq("show_in_post", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return attachSignedUrls((data ?? []) as PostMedia[]);
}

export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const { data: publishedPostsData, error: postsError } = await supabase
    .from("posts")
    .select(`
      id,
      author_id,
      title,
      slug,
      published_at,
      created_at
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (postsError) {
    throw new Error(postsError.message);
  }

  const publishedPosts = (publishedPostsData ?? []) as GalleryPost[];

  if (publishedPosts.length === 0) {
    return [];
  }

  const postIds = publishedPosts.map((post) => post.id);

  const { data: mediaData, error: mediaError } = await supabase
    .from("post_media")
    .select(PUBLIC_MEDIA_FIELDS)
    .eq("show_in_gallery", true)
    .in("post_id", postIds)
    .order("created_at", { ascending: false });

  if (mediaError) {
    throw new Error(mediaError.message);
  }

  const mediaItems = (mediaData ?? []) as PostMedia[];

  if (mediaItems.length === 0) {
    return [];
  }

  const authorIds = [
    ...new Set(publishedPosts.map((post) => post.author_id)),
  ];

  const { data: authorData, error: authorsError } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      page_title
    `)
    .in("id", authorIds)
    .eq("is_active", true);

  if (authorsError) {
    throw new Error(authorsError.message);
  }

  const authors = (authorData ?? []) as GalleryAuthor[];

  const postsById = new Map(
    publishedPosts.map((post) => [post.id, post]),
  );

  const authorsById = new Map(
    authors.map((author) => [author.id, author]),
  );

  const mediaWithUrls = await attachSignedUrls(mediaItems);

  return mediaWithUrls
    .map((media) => {
      const post = postsById.get(media.post_id);

      if (!post) {
        return null;
      }

      const author = authorsById.get(post.author_id);

      if (!author || !author.username) {
        return null;
      }

      return {
        media,
        post,
        author,
      };
    })
    .filter((item): item is GalleryItem => item !== null);
}