import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
} from "react";

import {
  deletePostMedia,
  fetchPostMedia,
  MAX_MEDIA_FILE_BYTES,
  updatePostMediaSettings,
  uploadPostMedia,
  type MediaDisplaySettings,
} from "../lib/postMedia";

import type {
  MediaPlacement,
  PostMediaWithUrl,
} from "../types/postMedia";

type PostMediaManagerProps = {
  postId: string;
  authorId: string;
  storyBody: string;
};

type MediaFormState = {
  altText: string;
  caption: string;

  showInPost: boolean;
  showInGallery: boolean;

  placement: MediaPlacement;
  afterParagraph: number | null;
  sortOrder: number;
};

const defaultUploadForm: MediaFormState = {
  altText: "",
  caption: "",

  showInPost: true,
  showInGallery: false,

  placement: "after-content",
  afterParagraph: null,
  sortOrder: 0,
};

function getParagraphCount(body: string): number {
  return body
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean).length;
}

function getFileName(storagePath: string): string {
  const parts = storagePath.split("/");
  return parts[parts.length - 1] || "Uploaded media";
}

function getMediaForm(media: PostMediaWithUrl): MediaFormState {
  return {
    altText: media.alt_text,
    caption: media.caption,

    showInPost: media.show_in_post,
    showInGallery: media.show_in_gallery,

    placement: media.placement,
    afterParagraph: media.after_paragraph,
    sortOrder: media.sort_order,
  };
}

function getReadableFileSize(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

function getPlacementLabel(
  placement: MediaPlacement,
  afterParagraph: number | null,
): string {
  if (placement === "before-content") {
    return "Before the story";
  }

  if (placement === "after-paragraph") {
    return `After paragraph ${afterParagraph ?? 1}`;
  }

  return "After the story";
}

export function PostMediaManager({
  postId,
  authorId,
  storyBody,
}: PostMediaManagerProps) {
  const [mediaItems, setMediaItems] = useState<PostMediaWithUrl[]>([]);
  const [mediaForms, setMediaForms] = useState<
    Record<string, MediaFormState>
  >({});

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] =
    useState<MediaFormState>(defaultUploadForm);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingMediaId, setSavingMediaId] = useState<string | null>(
    null,
  );
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(
    null,
  );

  const [message, setMessage] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const paragraphCount = getParagraphCount(storyBody);

  const loadMedia = useCallback(async () => {
    setLoading(true);

    try {
      const loadedMedia = await fetchPostMedia(postId);

      const nextForms: Record<string, MediaFormState> = {};

      for (const media of loadedMedia) {
        nextForms[media.id] = getMediaForm(media);
      }

      setMediaItems(loadedMedia);
      setMediaForms(nextForms);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load story media.",
      );
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadMedia();
  }, [loadMedia]);

  function updateUploadForm(
    patch: Partial<MediaFormState>,
  ) {
    setUploadForm((current) => ({
      ...current,
      ...patch,
    }));
  }

  function updateMediaForm(
    mediaId: string,
    patch: Partial<MediaFormState>,
  ) {
    setMediaForms((current) => ({
      ...current,
      [mediaId]: {
        ...(current[mediaId] ?? defaultUploadForm),
        ...patch,
      },
    }));
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setMessage(null);
    setSelectedFile(event.target.files?.[0] ?? null);
  }

  async function handleUpload() {
    setMessage(null);

    if (!selectedFile) {
      setMessage("Choose an image or video before uploading.");
      return;
    }

    if (
      uploadForm.placement === "after-paragraph" &&
      paragraphCount < 1
    ) {
      setMessage(
        "Write at least one paragraph before placing media after a paragraph.",
      );
      return;
    }

    setUploading(true);

    try {
      const settings: MediaDisplaySettings = {
        altText: uploadForm.altText,
        caption: uploadForm.caption,

        showInPost: uploadForm.showInPost,
        showInGallery: uploadForm.showInGallery,

        placement: uploadForm.placement,
        afterParagraph:
          uploadForm.placement === "after-paragraph"
            ? uploadForm.afterParagraph
            : null,
        sortOrder: uploadForm.sortOrder,
      };

      await uploadPostMedia({
        authorId,
        postId,
        file: selectedFile,
        settings,
      });

      setSelectedFile(null);
      setUploadForm(defaultUploadForm);
      setFileInputKey((current) => current + 1);

      await loadMedia();

      setMessage("Media uploaded successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload this media.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveMediaSettings(
    media: PostMediaWithUrl,
  ) {
    const form = mediaForms[media.id] ?? getMediaForm(media);

    setMessage(null);
    setSavingMediaId(media.id);

    try {
      await updatePostMediaSettings(media.id, {
        altText: form.altText,
        caption: form.caption,

        showInPost: form.showInPost,
        showInGallery: form.showInGallery,

        placement: form.placement,
        afterParagraph:
          form.placement === "after-paragraph"
            ? form.afterParagraph
            : null,
        sortOrder: form.sortOrder,
      });

      await loadMedia();

      setMessage("Media settings saved.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save media settings.",
      );
    } finally {
      setSavingMediaId(null);
    }
  }

  async function handleDeleteMedia(
    media: PostMediaWithUrl,
  ) {
    const confirmed = window.confirm(
      "Remove this media from the story? This deletes the uploaded file too.",
    );

    if (!confirmed) {
      return;
    }

    setMessage(null);
    setDeletingMediaId(media.id);

    try {
      const storageWarning = await deletePostMedia(media);

      await loadMedia();

      setMessage(
        storageWarning ?? "Media removed from this story.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to remove this media.",
      );
    } finally {
      setDeletingMediaId(null);
    }
  }

  function getParagraphOptions(selected: number | null) {
    const maximum = Math.max(paragraphCount, selected ?? 0);

    return Array.from(
      { length: maximum },
      (_, index) => index + 1,
    );
  }

  return (
    <section className="post-media-manager">
      <div className="post-media-manager__heading">
        <div>
          <p className="eyebrow">Images and videos</p>

          <h2>Add media to this story</h2>

          <p>
            Upload a file once, then decide whether it should appear
            inside the story, in the gallery, or in both places.
          </p>
        </div>

        <span className="media-paragraph-count">
          {paragraphCount}{" "}
          {paragraphCount === 1 ? "paragraph" : "paragraphs"} in story
        </span>
      </div>

      <div className="media-upload-card">
        <label className="form-field">
          <span>Choose image or video</span>

          <input
            key={fileInputKey}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            onChange={handleFileChange}
          />
        </label>

        {selectedFile ? (
          <p className="media-selected-file">
            Selected: <strong>{selectedFile.name}</strong> ·{" "}
            {getReadableFileSize(selectedFile.size)}
          </p>
        ) : null}

        <p className="media-help-text">
          Accepted: JPG, PNG, WebP, GIF, MP4, WebM, MOV. Maximum
          file size: 25 MB.
        </p>

        <div className="media-toggle-row">
          <label className="media-checkbox">
            <input
              type="checkbox"
              checked={uploadForm.showInPost}
              onChange={(event) =>
                updateUploadForm({
                  showInPost: event.target.checked,
                })
              }
            />
            Show inside this story
          </label>

          <label className="media-checkbox">
            <input
              type="checkbox"
              checked={uploadForm.showInGallery}
              onChange={(event) =>
                updateUploadForm({
                  showInGallery: event.target.checked,
                })
              }
            />
            Show in gallery
          </label>
        </div>

        <div className="media-settings-grid">
          <label className="form-field">
            <span>Place in story</span>

            <select
              value={uploadForm.placement}
              onChange={(event) => {
                const placement = event.target
                  .value as MediaPlacement;

                updateUploadForm({
                  placement,
                  afterParagraph:
                    placement === "after-paragraph"
                      ? 1
                      : null,
                });
              }}
            >
              <option value="before-content">Before story</option>

              {paragraphCount > 0 ? (
                <option value="after-paragraph">
                  After a paragraph
                </option>
              ) : null}

              <option value="after-content">After story</option>
            </select>
          </label>

          {uploadForm.placement === "after-paragraph" ? (
            <label className="form-field">
              <span>After which paragraph?</span>

              <select
                value={uploadForm.afterParagraph ?? 1}
                onChange={(event) =>
                  updateUploadForm({
                    afterParagraph: Number(event.target.value),
                  })
                }
              >
                {getParagraphOptions(
                  uploadForm.afterParagraph,
                ).map((paragraphNumber) => (
                  <option
                    key={paragraphNumber}
                    value={paragraphNumber}
                  >
                    After paragraph {paragraphNumber}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <label className="form-field">
          <span>Caption</span>

          <input
            value={uploadForm.caption}
            onChange={(event) =>
              updateUploadForm({
                caption: event.target.value,
              })
            }
            placeholder="Optional text shown below the image or video"
          />
        </label>

        <label className="form-field">
          <span>Alt text</span>

          <input
            value={uploadForm.altText}
            onChange={(event) =>
              updateUploadForm({
                altText: event.target.value,
              })
            }
            placeholder="Describe the image for readers who cannot see it"
          />
        </label>

        <button
          type="button"
          className="pill-button media-upload-button"
          disabled={uploading}
          onClick={() => {
            void handleUpload();
          }}
        >
          {uploading ? "Uploading..." : "Upload media"}{" "}
          <span>↑</span>
        </button>
      </div>

      {message ? (
        <p className="form-feedback">{message}</p>
      ) : null}

      {loading ? (
        <div className="media-empty-state">Loading media...</div>
      ) : null}

      {!loading && mediaItems.length === 0 ? (
        <div className="media-empty-state">
          No media attached to this story yet.
        </div>
      ) : null}

      {!loading && mediaItems.length > 0 ? (
        <div className="media-list">
          {mediaItems.map((media) => {
            const form =
              mediaForms[media.id] ?? getMediaForm(media);

            const paragraphOptions = getParagraphOptions(
              form.afterParagraph,
            );

            return (
              <article key={media.id} className="media-item">
                <div className="media-item__preview">
                  {media.signed_url ? (
                    media.media_type === "image" ? (
                      <img
                        src={media.signed_url}
                        alt={
                          media.alt_text ||
                          "Uploaded story media"
                        }
                      />
                    ) : (
                      <video
                        controls
                        preload="metadata"
                        src={media.signed_url}
                      >
                        Your browser does not support this video.
                      </video>
                    )
                  ) : (
                    <div className="media-preview-unavailable">
                      Preview unavailable
                    </div>
                  )}
                </div>

                <div className="media-item__content">
                  <div className="media-item__heading">
                    <div>
                      <p className="eyebrow">
                        {media.media_type}
                      </p>

                      <h3>{getFileName(media.storage_path)}</h3>

                      <p className="media-item__location">
                        Currently:{" "}
                        {getPlacementLabel(
                          media.placement,
                          media.after_paragraph,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="media-toggle-row">
                    <label className="media-checkbox">
                      <input
                        type="checkbox"
                        checked={form.showInPost}
                        onChange={(event) =>
                          updateMediaForm(media.id, {
                            showInPost: event.target.checked,
                          })
                        }
                      />
                      Show inside story
                    </label>

                    <label className="media-checkbox">
                      <input
                        type="checkbox"
                        checked={form.showInGallery}
                        onChange={(event) =>
                          updateMediaForm(media.id, {
                            showInGallery: event.target.checked,
                          })
                        }
                      />
                      Show in gallery
                    </label>
                  </div>

                  <div className="media-settings-grid">
                    <label className="form-field">
                      <span>Place in story</span>

                      <select
                        value={form.placement}
                        onChange={(event) => {
                          const placement = event.target
                            .value as MediaPlacement;

                          updateMediaForm(media.id, {
                            placement,
                            afterParagraph:
                              placement === "after-paragraph"
                                ? form.afterParagraph ?? 1
                                : null,
                          });
                        }}
                      >
                        <option value="before-content">
                          Before story
                        </option>

                        {paragraphCount > 0 ||
                        form.placement === "after-paragraph" ? (
                          <option value="after-paragraph">
                            After a paragraph
                          </option>
                        ) : null}

                        <option value="after-content">
                          After story
                        </option>
                      </select>
                    </label>

                    {form.placement === "after-paragraph" ? (
                      <label className="form-field">
                        <span>After which paragraph?</span>

                        <select
                          value={form.afterParagraph ?? 1}
                          onChange={(event) =>
                            updateMediaForm(media.id, {
                              afterParagraph: Number(
                                event.target.value,
                              ),
                            })
                          }
                        >
                          {paragraphOptions.map(
                            (paragraphNumber) => (
                              <option
                                key={paragraphNumber}
                                value={paragraphNumber}
                              >
                                After paragraph {paragraphNumber}
                              </option>
                            ),
                          )}
                        </select>
                      </label>
                    ) : null}
                  </div>

                  <label className="form-field">
                    <span>Caption</span>

                    <input
                      value={form.caption}
                      onChange={(event) =>
                        updateMediaForm(media.id, {
                          caption: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label className="form-field">
                    <span>Alt text</span>

                    <input
                      value={form.altText}
                      onChange={(event) =>
                        updateMediaForm(media.id, {
                          altText: event.target.value,
                        })
                      }
                    />
                  </label>

                  <div className="media-item__actions">
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={
                        savingMediaId === media.id ||
                        deletingMediaId === media.id
                      }
                      onClick={() => {
                        void handleSaveMediaSettings(media);
                      }}
                    >
                      {savingMediaId === media.id
                        ? "Saving..."
                        : "Save media settings"}{" "}
                      <span>→</span>
                    </button>

                    <button
                      type="button"
                      className="danger-button"
                      disabled={
                        savingMediaId === media.id ||
                        deletingMediaId === media.id
                      }
                      onClick={() => {
                        void handleDeleteMedia(media);
                      }}
                    >
                      {deletingMediaId === media.id
                        ? "Removing..."
                        : "Remove media"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ): null}
    </section>
  );
}