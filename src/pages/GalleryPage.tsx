export function GalleryPage() {
  return (
    <section className="gallery-page">
      <div className="page-container page-container--wide">
        <p className="eyebrow eyebrow--accent">The Gallery</p>

        <h1>Moments from our classroom.</h1>

        <div className="gallery-empty-state">
          <p>No photos or videos have been published yet.</p>

          <span>
            When writers upload media to approved stories, it will appear here.
          </span>
        </div>
      </div>
    </section>
  );
}