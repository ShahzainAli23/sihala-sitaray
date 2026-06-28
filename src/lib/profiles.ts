import { supabase } from "./supabase";
import type { Profile } from "../types/profile";

const PROFILE_FIELDS = `
  id,
  role,
  username,
  display_name,
  nav_label,
  page_title,
  bio,
  card_blurb,
  header_variant,
  header_image_one_path,
  header_image_two_path,
  nav_order,
  is_featured,
  is_active,
  created_at,
  updated_at
`;

export async function fetchActiveProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("role", "author")
    .eq("is_active", true)
    .not("username", "is", null)
    .order("nav_order", { ascending: true })
    .order("display_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Profile[];
}

export async function fetchActiveProfileByUsername(
  username: string,
): Promise<Profile | null> {
  const normalizedUsername = username.trim().toLowerCase();

  if (!normalizedUsername) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("role", "author")
    .eq("is_active", true)
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Profile | null;
}