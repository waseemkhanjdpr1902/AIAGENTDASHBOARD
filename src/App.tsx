import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { Toaster } from 'sonner';
import { motion } from 'framer-motion';

// Pages
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Invoices from './pages/Invoices';
import NoticeReply from './pages/NoticeReply';
import Subscription from './pages/Subscription';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import ReturnHelper from './pages/ReturnHelper';
import AiChat from './pages/AiChat';
import LateFeePage from './pages/LateFeePage';
import { ThemeProvider } from './hooks/use-theme';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30 dark:bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 w-full relative">
          <div className="md:hidden fixed top-4 left-4 z-50">
            <SidebarTrigger className="glass shadow-md" />
          </div>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={window.location.pathname}
              className="space-y-8"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/SEO';

// SEO Content Pages
import GstCalculatorSEO from './pages/seo/GstCalculatorSEO';
import InvoiceGeneratorSEO from './pages/seo/InvoiceGeneratorSEO';
import GstNoticeReplySEO from './pages/seo/GstNoticeReplySEO';
import GstrHelperSEO from './pages/seo/GstrHelperSEO';
import BlogIndex from './pages/BlogIndex';
import BlogPost from './pages/BlogPost';
import LandingPage from './pages/LandingPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import RefundPolicy from './pages/RefundPolicy';
import AboutUs from './pages/AboutUs';

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="light" storageKey="gst-ui-theme">
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Marketing/SEO Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/gst-calculator" element={<GstCalculatorSEO />} />
              <Route path="/invoice-generator" element={<InvoiceGeneratorSEO />} />
              <Route path="/gst-notice-reply" element={<GstNoticeReplySEO />} />
              <Route path="/gstr-helper" element={<GstrHelperSEO />} />
              
              {/* Blog System */}
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogPost />} />

              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/about" element={<AboutUs />} />

              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/calculator" element={<AppLayout><Calculator /></AppLayout>} />
              <Route path="/invoices" element={<AppLayout><Invoices /></AppLayout>} />
              <Route path="/ai-tools" element={<AppLayout><NoticeReply /></AppLayout>} />
              <Route path="/ai-chat" element={<AppLayout><AiChat /></AppLayout>} />
              <Route path="/returns" element={<AppLayout><ReturnHelper /></AppLayout>} />
              <Route path="/late-fee" element={<AppLayout><LateFeePage /></AppLayout>} />
              <Route path="/subscription" element={<AppLayout><Subscription /></AppLayout>} />
              <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
              <Route path="/admin" element={<AppLayout><Admin /></AppLayout>} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
          <Toaster position="top-center" />
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
