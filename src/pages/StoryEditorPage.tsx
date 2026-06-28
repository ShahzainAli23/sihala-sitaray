import { PostMediaManager } from "../components/PostMediaManager";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";
import { PostStatusBadge } from "../components/PostStatusBadge";
import {
  createPost,
  fetchMyPostById,
  updatePost,
  type PostEditorInput,
} from "../lib/posts";
import type { Post } from "../types/post";

type StoryFormState = {
  title: string;
  excerpt: string;
  body: string;
};

const emptyStoryForm: StoryFormState = {
  title: "",
  excerpt: "",
  body: "",
};

function getFormFromPost(post: Post): StoryFormState {
  return {
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
  };
}

export function StoryEditorPage() {
  const navigate = useNavigate();
  const { postId } = useParams();

  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [form, setForm] =
    useState<StoryFormState>(emptyStoryForm);

  const [loading, setLoading] = useState(Boolean(postId));
  const [message, setMessage] = useState<string | null>(null);

  const [savingAction, setSavingAction] = useState<
    "draft" | "pending" | null
  >(null);

  const isNewStory = !postId;

  useEffect(() => {
    let ignoreResult = false;

    async function loadPost() {
      if (!user) {
        return;
      }

      if (!postId) {
        setPost(null);
        setForm(emptyStoryForm);
        setLoading(false);
        return;
      }

      setLoading(true);
      setMessage(null);

      try {
        const loadedPost = await fetchMyPostById(postId, user.id);

        if (ignoreResult) {
          return;
        }

        setPost(loadedPost);

        if (loadedPost) {
          setForm(getFormFromPost(loadedPost));
        }
      } catch (error) {
        if (!ignoreResult) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to load this story.",
          );
        }
      } finally {
        if (!ignoreResult) {
          setLoading(false);
        }
      }
    }

    void loadPost();

    return () => {
      ignoreResult = true;
    };
  }, [postId, user]);

  async function saveStory(
    nextStatus: "draft" | "pending",
  ) {
    if (!user) {
      return;
    }

    setMessage(null);

    if (nextStatus === "pending") {
      if (!form.title.trim()) {
        setMessage(
          "Add a title before submitting your story for review.",
        );
        return;
      }

      if (!form.body.trim()) {
        setMessage(
          "Write your story before submitting it for review.",
        );
        return;
      }
    }

    const input: PostEditorInput = {
      title: form.title,
      excerpt: form.excerpt,
      body: form.body,
    };

    setSavingAction(nextStatus);

    try {
      const savedPost = post
        ? await updatePost(post.id, user.id, input, nextStatus)
        : await createPost(user.id, input, nextStatus);

      setPost(savedPost);
      setForm(getFormFromPost(savedPost));

      setMessage(
        nextStatus === "draft"
          ? "Draft saved."
          : "Story submitted for review.",
      );

      if (isNewStory) {
        navigate(`/dashboard/stories/${savedPost.id}/edit`, {
          replace: true,
        });
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save your story.",
      );
    } finally {
      setSavingAction(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveStory("draft");
  }

  if (loading) {
    return (
      <section className="dashboard-page">
        <div className="page-container page-container--narrow">
          <p className="eyebrow eyebrow--accent">My stories</p>

          <h1>Loading story...</h1>
        </div>
      </section>
    );
  }

  if (!isNewStory && !post) {
    return (
      <section className="dashboard-page">
        <div className="page-container page-container--narrow">
          <p className="eyebrow eyebrow--accent">My stories</p>

          <h1>Story not found</h1>

          <p className="dashboard-page__email">
            This story may have been deleted or may not belong to your
            account.
          </p>

          <Link to="/dashboard/stories" className="pill-button">
            Back to my stories <span>→</span>
          </Link>
        </div>
      </section>
    );
  }

  if (post?.status === "published") {
    return (
      <section className="dashboard-page">
        <div className="page-container page-container--narrow">
          <p className="eyebrow eyebrow--accent">My stories</p>

          <h1>This story is published.</h1>

          <p className="dashboard-page__email">
            Published stories are locked. Contact the site administrator
            if you need a correction.
          </p>

          <Link to="/dashboard/stories" className="pill-button">
            Back to my stories <span>→</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="page-container page-container--narrow">
        <div className="dashboard-page__topbar">
          <div>
            <p className="eyebrow eyebrow--accent">
              {isNewStory ? "New story" : "Edit story"}
            </p>

            <h1>
              {isNewStory
                ? "Start writing"
                : post?.title.trim() || "Untitled story"}
            </h1>

            {post ? (
              <div className="editor-status-row">
                <PostStatusBadge status={post.status} />

                <span>
                  {post.status === "rejected"
                    ? "Revise this story, then submit it again."
                    : "Save a draft whenever you need to pause."}
                </span>
              </div>
            ) : (
              <p className="dashboard-page__email">
                Save a draft first. You can add photos or videos after
                the draft exists.
              </p>
            )}
          </div>

          <Link to="/dashboard/stories" className="text-link">
            ← My stories
          </Link>
        </div>

        <form className="story-editor" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Story title</span>

            <input
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Give your story a title"
              maxLength={200}
            />
          </label>

          <label className="form-field">
            <span>Short introduction or preview</span>

            <textarea
              rows={3}
              value={form.excerpt}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  excerpt: event.target.value,
                }))
              }
              placeholder="A short sentence shown on the story card..."
            />
          </label>

          <label className="form-field">
            <span>Your story</span>

            <textarea
              className="story-editor__body"
              rows={18}
              value={form.body}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  body: event.target.value,
                }))
              }
              placeholder={`Write your story here...

Use an empty line between paragraphs.

You will be able to add pictures and videos between paragraphs after saving this draft.`}
            />
          </label>

          {message ? (
            <p
              className={
                message.includes("Unable") ||
                message.includes("Add ") ||
                message.includes("Write ")
                  ? "form-feedback form-feedback--error"
                  : "form-feedback"
              }
            >
              {message}
            </p>
          ) : null}

          <div className="story-editor__actions">
            <button
              type="submit"
              className="secondary-button"
              disabled={savingAction !== null}
            >
              {savingAction === "draft"
                ? "Saving draft..."
                : "Save draft"}{" "}
              <span>→</span>
            </button>

            <button
              type="button"
              className="pill-button story-editor__submit-button"
              disabled={savingAction !== null}
              onClick={() => {
                void saveStory("pending");
              }}
            >
              {savingAction === "pending"
                ? "Submitting..."
                : "Submit for review"}{" "}
              <span>→</span>
            </button>
          </div>
        </form>

                {post && user ? (
          <PostMediaManager
            postId={post.id}
            authorId={user.id}
            storyBody={form.body}
          />
        ) : (
          <section className="editor-media-placeholder">
            <p className="eyebrow">Images and videos</p>

            <h2>Save the draft before uploading media.</h2>

            <p>
              Images and videos need a saved story to attach to. Save
              this draft first, then return here to upload media and
              decide where it should appear.
            </p>
          </section>
        )}
        
      </div>
    </section>
  );
}