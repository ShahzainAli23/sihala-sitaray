import { Route, Routes } from "react-router-dom";

import { SiteHeader } from "./components/SiteHeader";
import { AuthorPage } from "./pages/AuthorPage";
import { GalleryPage } from "./pages/GalleryPage";
import { HomePage } from "./pages/HomePage";
import { MoreAuthorsPage } from "./pages/MoreAuthorsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stories/:username" element={<AuthorPage />} />
          <Route path="/others" element={<MoreAuthorsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="page-container">
          © {new Date().getFullYear()} Sihala Sitaray. Every star tells a
          story.
        </div>
      </footer>
    </div>
  );
}