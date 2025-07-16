import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CourseCard from '../components/ui/CourseCard';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFavorites } from '../hooks/useFavorites';

const FavoriteCourses = () => {
  const { favorites, isLoading, removeFavorite } = useFavorites();
  const [removedCourseId, setRemovedCourseId] = useState<string | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  // Handle real-time removal
  const handleRemoveFromFavorites = async (courseId: string) => {
    setRemovedCourseId(courseId);
    setTimeout(async () => {
      await removeFavorite(courseId);
      setRemovedCourseId(null);
    }, 300);
  };

  return (
    <>
      <Helmet>
        <title>Khóa học yêu thích | AnToRee</title>
        <meta name="description" content="Danh sách các khóa học bạn đã lưu và yêu thích" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Khóa học yêu thích
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {favorites.length > 0
                ? `Bạn đã lưu ${favorites.length} khóa học. Theo dõi và quản lý danh sách yêu thích của bạn.`
                : 'Khám phá và lưu những khóa học bạn quan tâm để xem lại sau.'}
            </p>
          </motion.div>

          {isLoading ? (
            // Loading skeleton
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {[...Array(4)].map((_, i) => (
                <div key={i} className="relative">
                  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : favorites.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {favorites.map((course) => (
                  <motion.div
                    key={course.id}
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate={removedCourseId === course.id ? "exit" : "visible"}
                    exit="exit"
                    className="relative"
                  >
                    <CourseCard 
                      course={course}
                      onRemoveFromFavorites={() => handleRemoveFromFavorites(course.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            // Empty state
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mb-8"
              >
                <span className="text-8xl inline-block">❤️</span>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Chưa có khóa học yêu thích nào
              </h3>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Hãy khám phá các khóa học và lưu những khóa học bạn quan tâm để xem lại sau
              </p>
              <motion.div
                
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl group"
                >
                  <span className="mr-2">Khám phá khóa học</span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
          )}

          {/* Quick Stats - Show only when there are favorites */}
          {favorites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {favorites.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  Khóa học đã lưu
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {favorites.reduce((acc, course) => acc + course.duration_hours, 0)}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  Giờ học
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                  {favorites.reduce((acc, course) => acc + course.number_of_lectures, 0)}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  Bài giảng
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                  {(favorites.reduce((acc, course) => acc + course.rating, 0) / favorites.length).toFixed(1)}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  Đánh giá trung bình
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default FavoriteCourses;