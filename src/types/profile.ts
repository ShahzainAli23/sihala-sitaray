export type HeaderVariant =
  | "text"
  | "single-image"
  | "two-images";

export type Profile = {
  id: string;
  role: "admin" | "author";

  username: string | null;

  display_name: string;
  nav_label: string;
  page_title: string;
  bio: string;
  card_blurb: string;

  header_variant: HeaderVariant;
  header_image_one_path: string | null;
  header_image_two_path: string | null;

  nav_order: number;
  is_featured: boolean;
  is_active: boolean;

  created_at: string;
  updated_at: string;
};