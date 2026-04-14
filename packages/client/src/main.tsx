import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';

import { ProtectedLayout } from './components/protected-layout';
import './index.css';
import { AdminUsersPage } from './pages/admin-users-page';
import { BookDetailPage } from './pages/book-detail-page';
import { BooksPage } from './pages/books-page';
import { HomePage } from './pages/home-page';
import { LoginPage } from './pages/login-page';
import { SurveyDetailPage } from './pages/survey-detail-page';
import { SurveysPage } from './pages/surveys-page';
import { WishlistPage } from './pages/wishlist-page';

const queryClient = new QueryClient();

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-slate-300">
    <h2 className="text-xl font-semibold text-white">{title}</h2>
    <p className="mt-2 text-sm">
      This area will be implemented in later tasks.
    </p>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/surveys" element={<SurveysPage />} />
            <Route path="/surveys/:id" element={<SurveyDetailPage />} />
            <Route
              path="/meetings"
              element={<PlaceholderPage title="Meetings" />}
            />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
          <Route path="*" element={<Outlet />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
