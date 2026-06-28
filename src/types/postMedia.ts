export type MediaType = "image" | "video";

export type MediaPlacement =
  | "before-content"
  | "after-paragraph"
  | "after-content";

export type PostMedia = {
  id: string;

  post_id: string;
  uploaded_by: string;

  storage_path: string;
  media_type: MediaType;

  alt_text: string;
  caption: string;

  show_in_post: boolean;
  show_in_gallery: boolean;

  placement: MediaPlacement;
  after_paragraph: number | null;
  sort_order: number;

  created_at: string;
};

export type PostMediaWithUrl = PostMedia & {
  signed_url: string | null;
};