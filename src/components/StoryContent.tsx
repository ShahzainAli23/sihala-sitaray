import { StoryMediaBlock } from "./StoryMediaBlock";

import type { PostMediaWithUrl } from "../types/postMedia";

type StoryContentProps = {
  body: string;
  media: PostMediaWithUrl[];
};

function splitIntoParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function sortMedia(media: PostMediaWithUrl[]) {
  return [...media].sort((first, second) => {
    if (first.sort_order !== second.sort_order) {
      return first.sort_order - second.sort_order;
    }

    return first.created_at.localeCompare(second.created_at);
  });
}

export function StoryContent({
  body,
  media,
}: StoryContentProps) {
  const paragraphs = splitIntoParagraphs(body);

  const visibleMedia = media.filter((item) => item.show_in_post);

  const beforeContent = sortMedia(
    visibleMedia.filter(
      (item) => item.placement === "before-content",
    ),
  );

  const afterContent = sortMedia(
    visibleMedia.filter(
      (item) =>
        item.placement === "after-content" ||
        (item.placement === "after-paragraph" &&
          (item.after_paragraph ?? 0) > paragraphs.length),
    ),
  );

  const mediaAfterParagraph = new Map<
    number,
    PostMediaWithUrl[]
  >();

  for (const item of visibleMedia) {
    if (
      item.placement !== "after-paragraph" ||
      !item.after_paragraph ||
      item.after_paragraph > paragraphs.length
    ) {
      continue;
    }

    const currentItems =
      mediaAfterParagraph.get(item.after_paragraph) ?? [];

    currentItems.push(item);

    mediaAfterParagraph.set(item.after_paragraph, currentItems);
  }

  return (
    <div className="story-content">
      {beforeContent.map((item) => (
        <StoryMediaBlock key={item.id} media={item} />
      ))}

      {paragraphs.map((paragraph, index) => {
        const paragraphNumber = index + 1;

        const inlineMedia = sortMedia(
          mediaAfterParagraph.get(paragraphNumber) ?? [],
        );

        return (
          <div key={`${paragraphNumber}-${paragraph.slice(0, 20)}`}>
            <p className="story-content__paragraph">{paragraph}</p>

            {inlineMedia.map((item) => (
              <StoryMediaBlock key={item.id} media={item} />
            ))}
          </div>
        );
      })}

      {afterContent.map((item) => (
        <StoryMediaBlock key={item.id} media={item} />
      ))}
    </div>
  );
}