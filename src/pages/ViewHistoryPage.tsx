import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useViewHistory } from '../hooks/useViewHistory';
import CourseCard from '../components/ui/CourseCard';

const ViewHistoryPage = () => {
  const { viewHistory, isLoading, clearViewHistory, removeFromHistory } = useViewHistory();
  const [removedCourseId, setRemovedCourseId] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

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
  const handleRemoveFromHistory = async (courseId: string) => {
    setRemovedCourseId(courseId);
    setTimeout(() => {
      removeFromHistory(courseId);
      setRemovedCourseId(null);
    }, 300);
  };

  return (
    <>
      <Helmet>
        <title>Lịch sử xem | AnToRee</title>
        <meta name="description" content="Danh sách các khóa học bạn đã xem trên Antoree" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Lịch sử xem
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {viewHistory.length > 0
                ? `Danh sách ${viewHistory.length} khóa học bạn đã xem gần đây.`
                : 'Bạn chưa xem khóa học nào.'}
            </p>
          </motion.div>

          {/* Controls */}
          {viewHistory.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-end mb-8"
            >
              <button
                onClick={() => setShowConfirmClear(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa lịch sử
              </button>
              
              {/* Confirmation dialog */}
              <AnimatePresence>
                {showConfirmClear && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setShowConfirmClear(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
                      onClick={e => e.stopPropagation()}
                    >
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Xóa lịch sử xem?</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem khóa học? Hành động này không thể hoàn tác.
                      </p>
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => setShowConfirmClear(false)}
                          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => {
                            clearViewHistory();
                            setShowConfirmClear(false);
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          Xác nhận xóa
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

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
          ) : viewHistory.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {viewHistory.map((course) => (
                  <motion.div
                    key={course.id}
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate={removedCourseId === course.id ? "exit" : "visible"}
                    exit="exit"
                    className="relative"
                  >
                    <div className="absolute -top-2 -right-2 z-10">
                      <button
                        onClick={() => handleRemoveFromHistory(course.id)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full shadow-md transition-colors"
                        title="Xóa khỏi lịch sử"
                      >
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <CourseCard course={course} />
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
                <span className="text-8xl inline-block">👀</span>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Chưa có lịch sử xem
              </h3>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Bắt đầu khám phá các khóa học - lịch sử xem của bạn sẽ xuất hiện tại đây
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
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

          {/* View Time Stats - Only show when there's history */}
          {viewHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"
            >
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <svg className="w-8 h-8 text-blue-500 dark:text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {viewHistory.length}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  Khóa học đã xem
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <svg className="w-8 h-8 text-purple-500 dark:text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {new Set(viewHistory.map(c => c.instructor?.fullname)).size}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  Giảng viên
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <svg className="w-8 h-8 text-green-500 dark:text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {viewHistory[0]?.title?.substring(0, 10)}...
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  Khóa học gần đây nhất
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewHistoryPage;