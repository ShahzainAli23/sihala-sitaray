import { supabase } from "./supabase";
import type {
  MediaPlacement,
  MediaType,
  PostMedia,
  PostMediaWithUrl,
} from "../types/postMedia";

export const MEDIA_BUCKET = "post-media";
export const MAX_MEDIA_FILE_BYTES = 25 * 1024 * 1024;

const MEDIA_FIELDS = `
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

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export type MediaDisplaySettings = {
  altText: string;
  caption: string;

  showInPost: boolean;
  showInGallery: boolean;

  placement: MediaPlacement;
  afterParagraph: number | null;
  sortOrder: number;
};

function getMediaType(file: File): MediaType {
  if (file.type.startsWith("image/")) {
    return "image";
  }

  if (file.type.startsWith("video/")) {
    return "video";
  }

  throw new Error("Choose an image or video file.");
}

function validateMediaFile(file: File) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(
      "Use JPG, PNG, WebP, GIF, MP4, WebM, or MOV files only.",
    );
  }

  if (file.size > MAX_MEDIA_FILE_BYTES) {
    throw new Error(
      "This file is larger than 25 MB. Please use a smaller or compressed file.",
    );
  }

  getMediaType(file);
}

function makeSafeExtension(file: File): string {
  const originalExtension = file.name
    .split(".")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (originalExtension) {
    return originalExtension;
  }

  if (file.type.startsWith("image/")) {
    return "image";
  }

  return "video";
}

function makeStoragePath(
  authorId: string,
  postId: string,
  file: File,
): string {
  const extension = makeSafeExtension(file);

  return `${authorId}/${postId}/${crypto.randomUUID()}.${extension}`;
}

async function addSignedUrl(
  media: PostMedia,
): Promise<PostMediaWithUrl> {
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(media.storage_path, 60 * 60);

  if (error) {
    console.warn(
      `Could not create signed preview URL for ${media.storage_path}:`,
      error.message,
    );

    return {
      ...media,
      signed_url: null,
    };
  }

  return {
    ...media,
    signed_url: data.signedUrl,
  };
}

export async function fetchPostMedia(
  postId: string,
): Promise<PostMediaWithUrl[]> {
  const { data, error } = await supabase
    .from("post_media")
    .select(MEDIA_FIELDS)
    .eq("post_id", postId)
    .order("placement", { ascending: true })
    .order("after_paragraph", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const media = (data ?? []) as PostMedia[];

  return Promise.all(media.map(addSignedUrl));
}

export async function uploadPostMedia({
  authorId,
  postId,
  file,
  settings,
}: {
  authorId: string;
  postId: string;
  file: File;
  settings: MediaDisplaySettings;
}): Promise<PostMediaWithUrl> {
  validateMediaFile(file);

  if (!settings.showInPost && !settings.showInGallery) {
    throw new Error(
      "Choose at least one location: story post, gallery, or both.",
    );
  }

  if (
    settings.placement === "after-paragraph" &&
    (!settings.afterParagraph || settings.afterParagraph < 1)
  ) {
    throw new Error(
      "Choose which paragraph this media should appear after.",
    );
  }

  const storagePath = makeStoragePath(authorId, postId, file);

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data, error: insertError } = await supabase
    .from("post_media")
    .insert({
      post_id: postId,
      uploaded_by: authorId,
      storage_path: storagePath,
      media_type: getMediaType(file),

      alt_text: settings.altText.trim(),
      caption: settings.caption.trim(),

      show_in_post: settings.showInPost,
      show_in_gallery: settings.showInGallery,

      placement: settings.placement,
      after_paragraph:
        settings.placement === "after-paragraph"
          ? settings.afterParagraph
          : null,
      sort_order: settings.sortOrder,
    })
    .select(MEDIA_FIELDS)
    .single();

  if (insertError) {
    await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
    throw new Error(insertError.message);
  }

  return addSignedUrl(data as PostMedia);
}

export async function updatePostMediaSettings(
  mediaId: string,
  settings: MediaDisplaySettings,
): Promise<PostMediaWithUrl> {
  if (!settings.showInPost && !settings.showInGallery) {
    throw new Error(
      "Choose at least one location: story post, gallery, or both.",
    );
  }

  if (
    settings.placement === "after-paragraph" &&
    (!settings.afterParagraph || settings.afterParagraph < 1)
  ) {
    throw new Error(
      "Choose which paragraph this media should appear after.",
    );
  }

  const { data, error } = await supabase
    .from("post_media")
    .update({
      alt_text: settings.altText.trim(),
      caption: settings.caption.trim(),

      show_in_post: settings.showInPost,
      show_in_gallery: settings.showInGallery,

      placement: settings.placement,
      after_paragraph:
        settings.placement === "after-paragraph"
          ? settings.afterParagraph
          : null,
      sort_order: settings.sortOrder,
    })
    .eq("id", mediaId)
    .select(MEDIA_FIELDS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return addSignedUrl(data as PostMedia);
}

export async function deletePostMedia(
  media: Pick<PostMedia, "id" | "storage_path">,
): Promise<string | null> {
  const { error: databaseError } = await supabase
    .from("post_media")
    .delete()
    .eq("id", media.id);

  if (databaseError) {
    throw new Error(databaseError.message);
  }

  const { error: storageError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .remove([media.storage_path]);

  if (storageError) {
    return "The media record was removed, but the uploaded file could not be deleted. Tell the administrator if it keeps happening.";
  }

  return null;
}