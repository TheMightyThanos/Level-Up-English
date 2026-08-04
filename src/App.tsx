import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTest, TestProvider } from '@/context/TestContext';
import { RootLayout } from '@/components/layout/RootLayout';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Lazy load all pages to drastically reduce the initial bundle size
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const TestSelectPage = lazy(() => import('@/pages/TestSelectPage'));
const ModeSelectPage = lazy(() => import('@/pages/ModeSelectPage'));
const TestPage = lazy(() => import('@/pages/TestPage'));
const ResultsPage = lazy(() => import('@/pages/ResultsPage'));
const AboutAppPage = lazy(() => import('@/pages/AboutAppPage'));
const AboutResearcherPage = lazy(() => import('@/pages/AboutResearcherPage'));
const StudyTipsPage = lazy(() => import('@/pages/StudyTipsPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function AppContent() {
  const { state } = useTest();

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
            <Route path="/about-app" element={<AboutAppPage />} />
            <Route path="/about-researcher" element={<AboutResearcherPage />} />
            <Route path="/study-tips" element={<StudyTipsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TestProvider>
  );
}

export default App;
