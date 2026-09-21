import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useTest, TestProvider } from '@/context/TestContext';
import { RootLayout } from '@/components/layout/RootLayout';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { supabase } from '@/lib/supabase';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Lazy load all pages to drastically reduce the initial bundle size
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const TestSelectPage = lazy(() => import('@/pages/TestSelectPage'));
const ModeSelectPage = lazy(() => import('@/pages/ModeSelectPage'));
const TestPage = lazy(() => import('@/pages/TestPage'));
const ResultsPage = lazy(() => import('@/pages/ResultsPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const SignUpPage = lazy(() => import('@/pages/SignUpPage'));
const ItemAnalysisDashboard = lazy(() => import('@/pages/ItemAnalysisDashboard'));
const AboutAppPage = lazy(() => import('@/pages/AboutAppPage'));
const AboutResearcherPage = lazy(() => import('@/pages/AboutResearcherPage'));
const StudyTipsPage = lazy(() => import('@/pages/StudyTipsPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function AppContent() {
  const { state } = useTest();
  const navigate = useNavigate();

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate("/dashboard", { replace: true });
        }
      });
    }
  }, [navigate]);

  let page: React.ReactNode;
  switch (state.view) {
    case 'login':
      page = <LoginPage />;
      break;
    case 'test-select':
      page = <TestSelectPage />;
      break;
    case 'mode-select':
      page = <ModeSelectPage />;
      break;
    case 'test':
      page = <TestPage />;
      break;
    case 'results':
      page = <ResultsPage />;
      break;
    default:
      page = <LoginPage />;
  }

  return <Suspense fallback={<LoadingScreen />}>{page}</Suspense>;
}

function App() {
  return (
    <TestProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<AppContent />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analysis" element={<ItemAnalysisDashboard />} />
            <Route path="/test" element={<Suspense fallback={<LoadingScreen />}><TestPage /></Suspense>} />
            <Route path="/about-app" element={<AboutAppPage />} />
            <Route path="/about-researcher" element={<AboutResearcherPage />} />
            <Route path="/study-tips" element={<StudyTipsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TestProvider>
  );
}

export default App;
