import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';

import { ProtectedLayout } from './components/protected-layout';
import './index.css';
import { AdminUsersPage } from './pages/admin-users-page';
import { BookDetailPage } from './pages/book-detail-page';
import { BooksPage } from './pages/books-page';
import { DateSurveyDetailPage } from './pages/date-survey-detail-page';
import { HomePage } from './pages/home-page';
import { LoginPage } from './pages/login-page';
import { MeetingDetailPage } from './pages/meeting-detail-page';
import { MeetingsPage } from './pages/meetings-page';
import { SurveyDetailPage } from './pages/survey-detail-page';
import { SurveysPage } from './pages/surveys-page';
import { WishlistPage } from './pages/wishlist-page';

const queryClient = new QueryClient();

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
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route path="/meetings/:id" element={<MeetingDetailPage />} />
            <Route
              path="/date-surveys/:id"
              element={<DateSurveyDetailPage />}
            />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
          <Route path="*" element={<Outlet />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
