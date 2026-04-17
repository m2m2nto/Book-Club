import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ErrorBoundary } from './components/error-boundary';
import { ProtectedLayout } from './components/protected-layout';
import { ToastProvider } from './components/ui/toast-provider';
import './index.css';
import { AdminUsersPage } from './pages/admin-users-page';
import { BookDetailPage } from './pages/book-detail-page';
import { BooksPage } from './pages/books-page';
import { DateSurveyDetailPage } from './pages/date-survey-detail-page';
import { AdminExportPage } from './pages/admin-export-page';
import { DashboardPage } from './pages/dashboard-page';
import { LoginPage } from './pages/login-page';
import { MeetingDetailPage } from './pages/meeting-detail-page';
import { MeetingsPage } from './pages/meetings-page';
import { NotFoundPage } from './pages/not-found-page';
import { StatsPage } from './pages/stats-page';
import { SurveyDetailPage } from './pages/survey-detail-page';
import { SurveysPage } from './pages/surveys-page';
import { WishlistPage } from './pages/wishlist-page';
import { ResetPasswordPage } from './pages/reset-password-page';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<DashboardPage />} />
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
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/export" element={<AdminExportPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
