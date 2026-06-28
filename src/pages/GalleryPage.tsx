import {
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { fetchGalleryItems } from "../lib/publicContent";

import type { GalleryItem } from "../lib/publicContent";

function getAuthorName(item: GalleryItem): string {
  return (
    item.author.display_name.trim() ||
    item.author.page_title.trim() ||
    "Author"
  );
}

export function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignoreResult = false;

    async function loadGallery() {
      setLoading(true);
      setError(null);

      try {
        const galleryItems = await fetchGalleryItems();

        if (!ignoreResult) {
          setItems(galleryItems);
        }
      } catch (caughtError) {
        if (!ignoreResult) {
          setItems([]);
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load the gallery.",
          );
        }
      } finally {
        if (!ignoreResult) {
          setLoading(false);
        }
      }
    }

    void loadGallery();

    return () => {
      ignoreResult = true;
    };
  }, []);

  return (
    <section className="gallery-page">
      <div className="page-container page-container--wide">
        <p className="eyebrow eyebrow--accent">The Gallery</p>

        <h1>Moments from our classroom.</h1>

        {loading ? (
          <div className="gallery-empty-state">
            <p>Loading the gallery...</p>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="gallery-empty-state">
            <p>Unable to load the gallery.</p>
            <span>{error}</span>
          </div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <div className="gallery-empty-state">
            <p>No photos or videos have been published yet.</p>

            <span>
              When writers choose “Show in gallery” on a published story,
              it will appear here.
            </span>
          </div>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <div className="gallery-masonry">
            {items.map((item) => {
              const storyUrl = `/stories/${item.author.username}/${item.post.slug}`;

              return (
                <article key={item.media.id} className="gallery-card">
                  <div className="gallery-card__media">
                    {item.media.signed_url ? (
                      item.media.media_type === "image" ? (
                        <img
                          src={item.media.signed_url}
                          alt={item.media.alt_text || "Gallery image"}
                          loading="lazy"
                        />
                      ) : (
                        <video
                          controls
                          preload="metadata"
                          src={item.media.signed_url}
                        >
                          Your browser does not support this video.
                        </video>
                      )
                    ) : (
                      <div className="gallery-card__unavailable">
                        Media unavailable
                      </div>
                    )}
                  </div>

                  <div className="gallery-card__content">
                    {item.media.caption.trim() ? (
                      <p className="gallery-card__caption">
                        {item.media.caption}
                      </p>
                    ) : null}

                    <p className="gallery-card__meta">
                      {getAuthorName(item)}
                    </p>

                    <Link to={storyUrl} className="gallery-card__story-link">
                      {item.post.title || "Read story"} <span>→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}