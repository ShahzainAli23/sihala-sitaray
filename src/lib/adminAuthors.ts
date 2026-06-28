import { supabase } from "./supabase";

import type { HeaderVariant, Profile } from "../types/profile";

const ADMIN_PROFILE_FIELDS = `
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

export type CreateAuthorInput = {
  email: string;
  temporaryPassword: string;

  displayName: string;
  username: string;
  navLabel: string;
  pageTitle: string;
  bio: string;
  cardBlurb: string;

  headerVariant: HeaderVariant;
  navOrder: number;
  isFeatured: boolean;
  isActive: boolean;
};

export type CreatedAuthor = {
  id: string;
  email: string;
  username: string;
  displayName: string;
};

type FunctionErrorWithContext = {
  message?: unknown;
  context?: unknown;
};

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return "Unable to create the author account.";
}

async function getFunctionErrorDetails(
  error: unknown,
): Promise<string> {
  const baseMessage = getErrorMessage(error);

  if (!error || typeof error !== "object") {
    return baseMessage;
  }

  const context = (error as FunctionErrorWithContext).context;

  if (!(context instanceof Response)) {
    return baseMessage;
  }

  try {
    const responseBody = (await context.clone().json()) as {
      error?: unknown;
    };

    if (typeof responseBody.error === "string") {
      return responseBody.error;
    }
  } catch {
    // The response may not contain JSON. Use the default message.
  }

  return baseMessage;
}

export async function fetchAdminAuthors(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(ADMIN_PROFILE_FIELDS)
    .eq("role", "author")
    .order("nav_order", { ascending: true })
    .order("display_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Profile[];
}

export async function createAuthor(
  input: CreateAuthorInput,
): Promise<CreatedAuthor> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error(
      "Your admin session has expired. Sign in again and retry.",
    );
  }

  const { data, error } = await supabase.functions.invoke(
    "admin-create-author",
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: {
        email: input.email.trim().toLowerCase(),
        temporaryPassword: input.temporaryPassword,

        displayName: input.displayName.trim(),
        username: input.username.trim().toLowerCase(),
        navLabel: input.navLabel.trim(),
        pageTitle: input.pageTitle.trim(),
        bio: input.bio.trim(),
        cardBlurb: input.cardBlurb.trim(),

        headerVariant: input.headerVariant,
        navOrder: input.navOrder,
        isFeatured: input.isFeatured,
        isActive: input.isActive,
      },
    },
  );

  if (error) {
    throw new Error(await getFunctionErrorDetails(error));
  }

  const author = data?.author;

  if (
    !author ||
    typeof author.id !== "string" ||
    typeof author.email !== "string" ||
    typeof author.username !== "string" ||
    typeof author.displayName !== "string"
  ) {
    throw new Error(
      "The author account was created, but the function returned an unexpected response.",
    );
  }

  return {
    id: author.id,
    email: author.email,
    username: author.username,
    displayName: author.displayName,
  };
}