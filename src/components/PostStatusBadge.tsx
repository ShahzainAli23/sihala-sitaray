import type { PostStatus } from "../types/post";

type PostStatusBadgeProps = {
  status: PostStatus;
};

const statusLabels: Record<PostStatus, string> = {
  draft: "Draft",
  pending: "Pending review",
  published: "Published",
  rejected: "Needs revision",
};

export function PostStatusBadge({
  status,
}: PostStatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {statusLabels[status]}
    </span>
  );
}