import { Route, Routes } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import { AdminRoute } from "./components/AdminRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SiteHeader } from "./components/SiteHeader";

import { AccountSettingsPage } from "./pages/AccountSettingsPage";
import { AdminAuthorsPage } from "./pages/AdminAuthorsPage";
import { AdminReviewPage } from "./pages/AdminReviewPage";
import { AuthorPage } from "./pages/AuthorPage";
import { DashboardPage } from "./pages/DashboardPage";
import { GalleryPage } from "./pages/GalleryPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MoreAuthorsPage } from "./pages/MoreAuthorsPage";
import { MyStoriesPage } from "./pages/MyStoriesPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PublicStoryPage } from "./pages/PublicStoryPage";
import { StoryEditorPage } from "./pages/StoryEditorPage";

export default function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <SiteHeader />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/stories/:username" element={<AuthorPage />} />

            <Route
              path="/stories/:username/:slug"
              element={<PublicStoryPage />}
            />

            <Route path="/others" element={<MoreAuthorsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route
                path="/dashboard/stories"
                element={<MyStoriesPage />}
              />

              <Route
                path="/dashboard/stories/new"
                element={<StoryEditorPage />}
              />

              <Route
                path="/dashboard/stories/:postId/edit"
                element={<StoryEditorPage />}
              />

              <Route path="/account" element={<AccountSettingsPage />} />

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminReviewPage />} />

                <Route
                  path="/admin/authors"
                  element={<AdminAuthorsPage />}
                />
              </Route>
            </Route>

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
    </AuthProvider>
  );
}