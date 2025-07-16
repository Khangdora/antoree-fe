import { Link } from 'react-router-dom';
import type { Course } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import CourseDetailModal from '../model/CourseDetailModal';
import { useFavorites } from '../../hooks/useFavorites';

interface CourseCardProps {
  course: Course;
  showAddToCart?: boolean;
  className?: string;
  onRemoveFromFavorites?: () => void;
}

const CourseCard = ({ course, showAddToCart = true, className = '', onRemoveFromFavorites }: CourseCardProps) => {

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const handleToggleFavorite = async () => {
    const isCurrentlyFavorite = isFavorite(course.id);
    
    if (isCurrentlyFavorite) {
      await removeFavorite(course.id);
      if (onRemoveFromFavorites) {
        onRemoveFromFavorites();
      }
    } else {
      await addFavorite(course.id);
    }
  };

  const handleOpenModal = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  // Format price function
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'Phát triển Web': '💻',
      'Thiết kế đồ họa': '🎨',
      'Ngoại ngữ': '🌍',
      'Khoa học Dữ liệu': '📊',
      'Sản xuất video': '🎬',
      'Thiết kế': '✏️',
      'Marketing': '📢',
      'Tin học văn phòng': '📋',
      'Kinh doanh': '💼',
      'Phát triển bản thân': '🚀',
      'Sức khỏe & Phong cách sống': '💪',
      'Nhiếp ảnh': '📸',
      'Phát triển Game': '🎮',
      'Nghệ thuật & Âm nhạc': '🎭',
    };
    return iconMap[category] || '📚';
  };

  // Get level badge color
  const getLevelBadgeColor = (level: string) => {
    const levelColors: { [key: string]: string } = {
      'Cơ bản': 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      'Trung cấp': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
      'Nâng cao': 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
      'Mọi cấp độ': 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    };
    return levelColors[level] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden course-card ${className}`}
    >
      <div className="relative">
        <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const iconElement = target.parentElement?.querySelector('.fallback-icon');
                if (iconElement) {
                  iconElement.classList.remove('hidden');
                }
              }}
            />
          ) : null}
          <div className="fallback-icon absolute inset-0 flex items-center justify-center text-4xl">
            {getCategoryIcon(course.category)}
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {course.is_bestseller === 1 && (
            <span className="bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
              Bán chạy
            </span>
          )}
          {course.is_new === 1 && (
            <span className="bg-green-500 text-white px-2 py-1 text-xs font-bold rounded">
              Mới
            </span>
          )}
        </div>

        {/* Level badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${getLevelBadgeColor(course.level)}`}>
            {course.level}
          </span>
        </div>

        {/* Duration overlay */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 text-xs rounded">
          {course.duration_hours}h
        </div>
      </div>

      <div className="p-4">
        {/* Category */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            {course.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <Link to={`/course/${course.slug}`} className="hover:underline">
            {course.title}
          </Link>
        </h3>

        {/* Instructor */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {course.instructor.fullname || 'Giảng viên chuyên nghiệp'}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400 rating-stars">
            {'★'.repeat(Math.floor(course.rating))}
            {'☆'.repeat(5 - Math.floor(course.rating))}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            {course.rating} ({course.number_of_reviews.toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {course.discount_price ? (
              <>
                <span className="text-lg font-bold price-discount">
                  {formatPrice(course.discount_price)}
                </span>
                <span className="text-sm price-original">
                  {formatPrice(course.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold price-discount">
                {formatPrice(course.price)}
              </span>
            )}
          </div>
          
          {/* Course stats */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {course.number_of_lectures} bài
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors cursor-pointer"
            onClick={() => handleOpenModal(course)}
          >
            Xem chi tiết
          </motion.button>
          
          {showAddToCart && (
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer relative"
              onClick={handleToggleFavorite}
              title={isFavorite(course.id) ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
            >
              <AnimatePresence mode="wait">
                <motion.svg
                  key={isFavorite(course.id) ? 'filled' : 'outlined'}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`w-5 h-5 ${
                    isFavorite(course.id)
                      ? 'text-red-500 fill-current'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={isFavorite(course.id) ? 0 : 2}
                >
                  {isFavorite(course.id) ? (
                    <path
                      fill="currentColor"
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  )}
                </motion.svg>
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </div>

      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

    </motion.div>

  );
};

export default CourseCard;
