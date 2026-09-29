/**
 * App Component - Vạn Cổ Luân Hồi
 * Shell điều hướng chuẩn Mobile-First phong cách Cổ Phong Hắc Sắc Ngọc Bích
 * Bố cục đồng nhất: Sidebar (Collapsible Desktop / Drawer Mobile) + Header + Main Content + Footer
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './ui/context/ThemeContext.js';
import { AuthProvider } from './ui/context/AuthContext.js';
import { Sidebar } from './ui/components/Sidebar.js';
import { Header } from './ui/components/Header.js';
import { MobileNavbar } from './ui/components/MobileNavbar.js';
import { Footer } from './ui/components/Footer.js';
import { AuthModal } from './ui/components/AuthModal.js';
import { SearchModal } from './ui/components/SearchModal.js';
import { AdCarouselBanner } from './ui/components/AdCarouselBanner.js';
import { DonationModal } from './ui/components/DonationModal.js';

import { HomeView } from './ui/views/HomeView.js';
import { ExploreView } from './ui/views/ExploreView.js';
import { PostDetailView } from './ui/views/PostDetailView.js';
import { BookmarksView } from './ui/views/BookmarksView.js';
import { ProfileView } from './ui/views/ProfileView.js';
import { AdminView } from './ui/views/AdminView.js';
import { LegalView } from './ui/views/LegalView.js';
import { LifeExperienceView } from './ui/views/LifeExperienceView.js';
import { LifeExperienceGame } from './ui/components/LifeExperienceGame.js';

function AppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'explore' | 'post-detail' | 'bookmarks' | 'profile' | 'admin' | 'legal' | 'life-experience'>('home');
  const [viewParams, setViewParams] = useState<any>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isLifeExperiencePopupOpen, setIsLifeExperiencePopupOpen] = useState(false);

  // Trạng thái thu gọn Sidebar Desktop
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('vclh_sidebar_collapsed') === 'true';
  });

  // Trạng thái Drawer Mobile
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('vclh_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Sync route từ path URL khi tải trang
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      if (path.startsWith('/bai-viet/')) {
        const slug = path.replace('/bai-viet/', '');
        setCurrentView('post-detail');
        setViewParams({ slug });
      } else if (path === '/kham-pha') {
        setCurrentView('explore');
      } else if (path === '/da-luu') {
        setCurrentView('bookmarks');
      } else if (path === '/ca-nhan') {
        setCurrentView('profile');
      } else if (path === '/quan-tri') {
        setCurrentView('admin');
      } else if (path === '/dieu-khoan') {
        setCurrentView('legal');
      } else if (path === '/trai-nghiem-nhan-sinh') {
        setCurrentView('life-experience');
      } else {
        setCurrentView('home');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, []);

  const handleNavigate = (view: string, params?: any) => {
    setCurrentView(view as any);
    setViewParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL history for SEO and bookmarking
    if (view === 'post-detail' && params?.slug) {
      window.history.pushState({}, '', `/bai-viet/${params.slug}`);
    } else if (view === 'explore') {
      window.history.pushState({}, '', '/kham-pha');
    } else if (view === 'bookmarks') {
      window.history.pushState({}, '', '/da-luu');
    } else if (view === 'profile') {
      window.history.pushState({}, '', '/ca-nhan');
    } else if (view === 'admin') {
      window.history.pushState({}, '', '/quan-tri');
    } else if (view === 'legal') {
      window.history.pushState({}, '', '/dieu-khoan');
    } else if (view === 'life-experience') {
      window.history.pushState({}, '', '/trai-nghiem-nhan-sinh');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EE] dark:bg-[#07090D] text-slate-800 dark:text-slate-100 bg-ink-mesh flex transition-colors duration-200">
      
      {/* 1. SIDEBAR (Collapsible Desktop + Drawer Mobile) */}
      <Sidebar
        currentView={currentView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
        onNavigate={handleNavigate}
        onOpenDonationModal={() => setIsDonationOpen(true)}
        onOpenLifeExperiencePopup={() => setIsLifeExperiencePopupOpen(true)}
      />

      {/* 2. MAIN CONTAINER AREA (Responsive padding matching sidebar width) */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header / Thanh điều hướng chính (luôn nằm trên cùng) */}
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleMobileDrawer={() => setIsMobileDrawerOpen(true)}
        />

        {/* Quảng Cáo ở Header nằm dưới thanh điều hướng theo yêu cầu */}
        <AdCarouselBanner
          placement="header"
          onNavigate={handleNavigate}
          onOpenDonationModal={() => setIsDonationOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-grow pt-4">
          {currentView === 'home' && (
            <HomeView
              onNavigate={handleNavigate}
              onOpenDonationModal={() => setIsDonationOpen(true)}
            />
          )}
          {currentView === 'explore' && (
            <ExploreView
              initialCategory={viewParams?.category}
              onNavigate={handleNavigate}
              onOpenDonationModal={() => setIsDonationOpen(true)}
            />
          )}
          {currentView === 'life-experience' && (
            <LifeExperienceView
              onNavigate={handleNavigate}
              onOpenDonationModal={() => setIsDonationOpen(true)}
              onOpenFloatingPopup={() => setIsLifeExperiencePopupOpen(true)}
            />
          )}
          {currentView === 'post-detail' && (
            <PostDetailView
              slug={viewParams?.slug || 'lam-gi-co-so-kiep'}
              onNavigate={handleNavigate}
              onOpenDonationModal={() => setIsDonationOpen(true)}
            />
          )}
          {currentView === 'bookmarks' && <BookmarksView onNavigate={handleNavigate} />}
          {currentView === 'profile' && <ProfileView onNavigate={handleNavigate} />}
          {currentView === 'admin' && <AdminView onNavigate={handleNavigate} />}
          {currentView === 'legal' && <LegalView onNavigate={handleNavigate} />}
        </main>

        {/* Editorial Footer */}
        <Footer
          onNavigate={handleNavigate}
          onOpenDonationModal={() => setIsDonationOpen(true)}
        />
      </div>

      {/* Floating Bottom Bar Ad Carousel Banner (Trượt ngang 3-5s, có nút thu gọn/đóng) */}
      <AdCarouselBanner
        placement="bottom_bar"
        onNavigate={handleNavigate}
        onOpenDonationModal={() => setIsDonationOpen(true)}
      />

      {/* Mobile Bottom Navigation (Capped <= 15% Viewport) */}
      <MobileNavbar
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Global Modals */}
      <AuthModal />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />
      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
      />

      {/* Floating Draggable Life Experience Game Popup */}
      {isLifeExperiencePopupOpen && (
        <LifeExperienceGame
          isPopup={true}
          onClose={() => setIsLifeExperiencePopupOpen(false)}
        />
      )}

      {/* Floating Quick Launcher Button (khi popup đóng) */}
      {!isLifeExperiencePopupOpen && currentView !== 'life-experience' && (
        <button
          onClick={() => setIsLifeExperiencePopupOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xl border border-emerald-400/40 backdrop-blur-md transition-all hover:scale-105 cursor-pointer font-sans-ui"
          title="Mở trò chơi Trải Nghiệm Nhân Sinh"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Trải Nghiệm Nhân Sinh</span>
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
