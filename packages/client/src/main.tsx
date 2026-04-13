import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/app-shell';
import './index.css';
import { HomePage } from './pages/home-page';

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
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<PlaceholderPage title="Books" />} />
            <Route
              path="/meetings"
              element={<PlaceholderPage title="Meetings" />}
            />
            <Route
              path="/members"
              element={<PlaceholderPage title="Members" />}
            />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
