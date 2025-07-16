import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import PromotionsPage from './pages/PromotionsPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import HomePage from './pages/HomePage';
import FilterPage from './pages/FilterPage';
import FavoriteCourses from './pages/FavoriteCoursesPage';
import ScrollToTop from './components/utils/ScrollToTop';
import CoursePage from './pages/CoursePage';
import { AIChatWidget } from './components/ui/AIChatWidget';
import ViewHistoryPage from './pages/ViewHistoryPage';

function App() {
  return (
    <HelmetProvider>
      <Helmet>
        {/* Favicon */}
        <link rel="icon" href="/ico.png" />
        <link rel="shortcut icon" href="/ico.png" type="image/png" />
        <link rel="apple-touch-icon" href="/ico.png" />
        
        {/* PWA meta tags */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Antoree" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:image" content="/ico.png" />
      </Helmet>
      <ThemeProvider>
          <Router>
            <ScrollToTop />
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/filter" element={<FilterPage />} />
                <Route path="/promotions" element={<PromotionsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/favorites" element={<FavoriteCourses />} />
                <Route path="/history" element={<ViewHistoryPage />} />
                <Route path="/course/:slug" element={<CoursePage />} />
                {/* Add more routes as needed */}
                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        404 - Trang không tìm thấy
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Trang bạn đang tìm kiếm không tồn tại.
                      </p>
                      <button 
                        onClick={() => window.history.back()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                      >
                        Quay lại
                      </button>
                    </div>
                  </div>
                } />
              </Routes>
            </Layout>
            <AIChatWidget />
          </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;