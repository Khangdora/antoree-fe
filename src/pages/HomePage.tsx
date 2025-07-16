import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { coursesService, type Course as APICourse } from '../services/api';
import { CourseCardSkeleton, CategoryCardSkeleton } from '../components/ui/Loading';
import { dataProcessor } from '../services/dataProcessor';
import type { CourseWithInstructor as LocalCourse } from '../services/dataProcessor';
import { useTheme } from '../contexts/ThemeContext';
import CourseCard from '../components/ui/CourseCard';

// Unified Course type
type Course = APICourse | LocalCourse;

const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const videoPopupRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();

  // Load featured courses from API with enhanced error handling
  const loadFeaturedCourses = async () => {
    setIsLoadingCourses(true);
    setError(null);
    
    try {
      // Get page 1 with limit 8 for homepage
      const response = await coursesService.getAllCourses(1, 8);
      if (response && Array.isArray(response)) {
        setFeaturedCourses(response);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err: any) {
      console.error('Mock API Error:', err);
      // Use local data as fallback
      const localCourses = dataProcessor.getFeaturedCourses(8);
      setFeaturedCourses(localCourses);
      setError('⚠️ Đang sử dụng dữ liệu offline.');
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Load categories with enhanced error handling
  const loadCategories = async () => {
    setIsLoadingCategories(true);
    
    try {
      const categoryData = await coursesService.getCategories();
      if (categoryData && Array.isArray(categoryData)) {
        // Extract name and count from category data
        const formattedCategories = categoryData
          .filter(cat => cat.name)
          .map(cat => ({
            name: cat.name,
            count: Math.floor(Math.random() * 20) + 5 // Random count for visual display
          }))
          .slice(0, 8); // Get top 8 categories
        
        setCategories(formattedCategories);
      } else {
        throw new Error('Invalid category data format');
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      // Fallback to local data
      const localCategories = dataProcessor.getCategories().slice(0, 8);
      const categoryData = localCategories.map(name => ({ 
        name, 
        count: Math.floor(dataProcessor.getStats().total_courses / localCategories.length) 
      }));
      setCategories(categoryData);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Retry function
  const retryLoading = () => {
    setError(null);

    loadFeaturedCourses();
    loadCategories();
  };

  // Click outside handler for video popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (videoPopupRef.current && !videoPopupRef.current.contains(event.target as Node)) {
        setShowVideoPopup(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [videoPopupRef]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadFeaturedCourses(),
        loadCategories()
      ]);
    };

    loadData();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Category icons (SVG)
  const getCategoryIcon = (categoryName: string) => {
    const iconClass = "w-8 h-8";
    
    switch (categoryName.toLowerCase()) {
      case 'web development':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'data science':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'mobile development':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
          </svg>
        );
      case 'machine learning':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'design':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z" />
          </svg>
        );
      case 'marketing':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        );
      case 'business':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'photography':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>Antoree - Nền tảng học trực tuyến hàng đầu Việt Nam</title>
        <meta name="description" content="Khám phá hàng nghìn khóa học chất lượng cao với giá ưu đãi. Học từ các chuyên gia hàng đầu trong ngành công nghệ, thiết kế, marketing và kinh doanh." />
        <meta name="keywords" content="khóa học online, học trực tuyến, lập trình, thiết kế, marketing, kinh doanh" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Enhanced Error Banner with GitHub link */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-yellow-50 border-l-4 border-yellow-400 p-4 shadow-lg"
            >
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-yellow-700 font-medium whitespace-pre-line">{error}</p>
                      {error.includes('GitHub') && (
                        <div className="mt-2 flex items-center space-x-4">
                          <a 
                            href="https://github.com/your-username/antoree" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-yellow-800 hover:text-yellow-900 font-medium underline transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            Xem source code trên GitHub
                          </a>
                          <span className="text-yellow-600">|</span>
                          <span className="text-yellow-700 text-sm">
                            💡 Render server có thể cần 2-3 phút để khởi động
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={retryLoading}
                    className="text-yellow-700 hover:text-yellow-900 font-medium underline transition-colors ml-4 flex-shrink-0"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative py-20 overflow-hidden"
          style={{
            background: `linear-gradient(to right, 
              ${theme === 'dark' ? 'rgba(30, 58, 138, 0.9)' : 'rgb(37, 99, 235)'}, 
              ${theme === 'dark' ? 'rgba(76, 29, 149, 0.9)' : 'rgb(124, 58, 237)'}, 
              ${theme === 'dark' ? 'rgba(157, 23, 77, 0.9)' : 'rgb(219, 39, 119)'})`
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            {/* Vòng tròn lớn di chuyển chậm */}
            <motion.div 
              className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/5 dark:bg-white/3 blur-3xl"
              animate={{ 
                x: [0, 30, 0], 
                y: [0, -30, 0], 
                scale: [1, 1.1, 1] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 20, 
                ease: "easeInOut" 
              }}
            ></motion.div>
            
            {/* Vòng tròn nhỏ phía dưới */}
            <motion.div 
              className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-white/10 dark:bg-white/5 blur-2xl"
              animate={{ 
                x: [0, -40, 0], 
                y: [0, 20, 0], 
                scale: [1, 1.2, 1] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 15, 
                ease: "easeInOut",
                delay: 2 
              }}
            ></motion.div>
            
            {/* Các vân sáng hình dạng ngẫu nhiên */}
            {Array.from({ length: 5 }).map((_, index) => (
              <motion.div 
                key={index}
                className="absolute rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-300/5 dark:via-purple-300/5 dark:to-pink-300/5"
                style={{
                  width: Math.random() * 200 + 100,
                  height: Math.random() * 200 + 100,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
                animate={{
                  x: [0, Math.random() * 40 - 20],
                  y: [0, Math.random() * 40 - 20],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            ))}
          </div>

          {/* Lines pattern overlay */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10">
            <div className="h-full w-full" 
              style={{
                backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "60px 60px"
              }}
            ></div>
          </div>

          {/* <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div> */}
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Image Section - Left */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="order-2 md:order-1 relative hidden md:block"
              >
                <div className="relative">
                  {/* Main image */}
                  <motion.div
                    className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <img 
                      src={`/assets/images/hero_banner_img_1.jpg`}
                      alt="Học viên đang học trực tuyến" 
                      className="w-full rounded-2xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://i.imgur.com/1FBrbZX.jpg';
                      }}
                    />
                    
                    {/* Video play button overlay */}
                    <motion.button
                      onClick={() => setShowVideoPopup(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 group hover:bg-black/40 transition-all duration-300 cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div 
                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl"
                        whileHover={{ 
                          boxShadow: "0 0 0 10px rgba(255,255,255,0.2)",
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.svg 
                          className="w-8 h-8 text-blue-600 ml-1" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                          animate={{ 
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2,
                          }}
                        >
                          <path d="M4 4l12 6-12 6z" />
                        </motion.svg>
                      </motion.div>
                      <span className="absolute bottom-8 text-white font-medium bg-black/50 px-4 py-2 rounded-full text-sm">
                        Xem video giới thiệu
                      </span>
                    </motion.button>
                  </motion.div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl opacity-70 -z-10 blur-md"></div>
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-70 -z-10 blur-md"></div>
                  
                  {/* Floating badges */}
                  <motion.div 
                    className="absolute top-5 -right-10 bg-white text-blue-600 shadow-xl rounded-xl px-4 py-2 font-bold"
                    initial={{ opacity: 0, y: 20, rotate: 5 }}
                    animate={{ opacity: 1, y: 0, rotate: 5 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                  >
                    50,000+ học viên
                  </motion.div>
                  
                  <motion.div 
                    className="absolute -bottom-5 -left-10 bg-white text-purple-600 shadow-xl rounded-xl px-4 py-2 font-bold"
                    initial={{ opacity: 0, y: -20, rotate: -5 }}
                    animate={{ opacity: 1, y: 0, rotate: -5 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    whileHover={{ y: 5 }}
                  >
                    1,000+ khóa học
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Content Section - Right */}
              <div className="order-1 md:order-2 text-center md:text-left text-white">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                >
                  Học hỏi không{' '}
                  <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    giới hạn
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl md:mx-0 mx-auto"
                >
                  Khám phá hàng nghìn khóa học chất lượng cao từ các chuyên gia hàng đầu. 
                  Nâng cao kỹ năng và xây dựng sự nghiệp thành công ngay hôm nay.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center"
                >
                  <Link
                    to="/courses"
                    className="group inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-xl"
                  >
                    <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Khám phá khóa học
                  </Link>
                  
                  <motion.button
                    onClick={() => setShowVideoPopup(true)}
                    className="group inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 transform hover:scale-105 cursor-pointer"
                    whileHover={{ boxShadow: "0 0 15px rgba(255,255,255,0.5)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    Xem video giới thiệu
                  </motion.button>
                </motion.div>
                
                {/* Trust indicators - giữ nguyên */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="mt-12 flex flex-wrap justify-center md:justify-start items-center gap-8 text-blue-100"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span>4.8/5 đánh giá</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                    </svg>
                    <span>50,000+ học viên</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>Chứng chỉ được công nhận</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Categories Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Danh mục phổ biến
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Chọn lĩnh vực bạn muốn phát triển và bắt đầu hành trình học tập của mình
              </p>
            </motion.div>

            {isLoadingCategories ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, index) => (
                  <CategoryCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8"
              >
                {categories.map((category) => (
                  <motion.div
                    key={category.name}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="group"
                  >
                    <Link
                      to={`/courses?category=${encodeURIComponent(category.name)}`}
                      className="block p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-2xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl group-hover:from-blue-200 group-hover:to-purple-200 dark:group-hover:from-blue-800 dark:group-hover:to-purple-800 transition-all duration-300 mb-6 text-blue-600 dark:text-blue-400">
                          {getCategoryIcon(category.name)}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                          {category.count} khóa học
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* Featured Courses Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Khóa học nổi bật
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Những khóa học được đánh giá cao nhất và được học viên yêu thích nhất
              </p>
            </motion.div>

            {isLoadingCourses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, index) => (
                  <CourseCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                {featuredCourses.map((course) => (
                  <CourseCard course={course} />
                ))}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <Link
                to="/filter"
                className="inline-flex items-center px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Xem tất cả khóa học
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              {[
                { number: '1,000+', label: 'Khóa học', icon: '📚' },
                { number: '50,000+', label: 'Học viên', icon: '👥' },
                { number: '200+', label: 'Giảng viên', icon: '👨‍🏫' },
                { number: '4.8/5', label: 'Đánh giá', icon: '⭐' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-blue-100 text-lg font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Video Popup */}
        <AnimatePresence>
          {showVideoPopup && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 md:p-10"
            >
              <motion.div 
                ref={videoPopupRef}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white dark:bg-gray-900 p-2 rounded-xl w-full max-w-4xl relative aspect-video"
              >
                <button 
                  onClick={() => setShowVideoPopup(false)} 
                  className="absolute -top-4 -right-4 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg z-10 cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden aspect-video">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/ya31HMyeHX0?autoplay=1" 
                    title="Antoree - Video Giới Thiệu"
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Testimonials Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Học viên nói gì về chúng tôi
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Hơn 50,000 học viên đã tin tưởng và đạt được thành công với Antoree
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                {
                  name: 'Nguyễn Văn An',
                  role: 'Fullstack Developer',
                  content: 'Khóa học React rất chi tiết và thực tế. Tôi đã có thể áp dụng ngay vào công việc và được tăng lương.',
                  rating: 5,
                  avatar: '👨‍💻'
                },
                {
                  name: 'Trần Thị Bích',
                  role: 'UI/UX Designer',
                  content: 'Giảng viên rất tận tâm, khóa học Figma giúp tôi thiết kế giao diện chuyên nghiệp hơn rất nhiều.',
                  rating: 5,
                  avatar: '👩‍🎨'
                },
                {
                  name: 'Lê Minh Cường',
                  role: 'Digital Marketing Manager',
                  content: 'Nội dung cập nhật, thực tế. Sau khóa học Marketing tôi đã tăng ROI cho công ty lên 300%.',
                  rating: 5,
                  avatar: '👨‍💼'
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    ))}
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">{testimonial.avatar}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-20 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 relative overflow-hidden"
        >
          {/* Background elements */}
          <div className="absolute top-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Bắt đầu hành trình học tập của bạn ngay hôm nay
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto"
            >
              Tham gia cộng đồng học tập trực tuyến lớn nhất Việt Nam. 
              Hơn 50,000 học viên đã thay đổi cuộc đời với Antoree.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/courses"
                className="group inline-flex items-center px-10 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Bắt đầu học ngay
              </Link>
              
              <Link
                to="/contact"
                className="group inline-flex items-center px-10 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Tư vấn miễn phí
              </Link>
            </motion.div>
            
            {/* Special offer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-8 inline-block bg-yellow-400 text-purple-900 px-6 py-2 rounded-full font-bold text-lg animate-pulse"
            >
              🎉 Ưu đãi đặc biệt: Giảm 50% cho 100 học viên đầu tiên!
            </motion.div>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default HomePage;
