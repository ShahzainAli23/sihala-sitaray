import { AuthProvider } from "./auth/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SiteHeader } from "./components/SiteHeader";
import { AccountSettingsPage } from "./pages/AccountSettingsPage";
import { AuthorPage } from "./pages/AuthorPage";
import { DashboardPage } from "./pages/DashboardPage";
import { GalleryPage } from "./pages/GalleryPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MoreAuthorsPage } from "./pages/MoreAuthorsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

import { Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <SiteHeader />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/stories/:username" element={<AuthorPage />} />
            <Route path="/others" element={<MoreAuthorsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/account" element={<AccountSettingsPage />} />
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