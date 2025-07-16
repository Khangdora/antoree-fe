import { motion } from 'framer-motion';

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', color = 'blue' }: { size?: 'sm' | 'md' | 'lg'; color?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-gray-200 border-t-${color}-600 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
};

// Skeleton Card Component for Course Loading
export const CourseCardSkeleton = () => {
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="animate-pulse">
        {/* Image skeleton */}
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
        
        <div className="p-4 space-y-3">
          {/* Title skeleton */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          
          {/* Instructor skeleton */}
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          
          {/* Rating skeleton */}
          <div className="flex items-center space-x-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-10"></div>
          </div>
          
          {/* Price skeleton */}
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          
          {/* Details skeleton */}
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          
          {/* Button skeleton */}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </motion.div>
  );
};

// Category Card Skeleton
export const CategoryCardSkeleton = () => {
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="animate-pulse">
        {/* Icon skeleton */}
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3"></div>
        
        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
        
        {/* Count skeleton */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
      </div>
    </motion.div>
  );
};

// Page Loading Component
export const PageLoading = () => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          duration: 0.5,
          type: "spring",
          stiffness: 260,
          damping: 20 
        }}
      >
        <LoadingSpinner size="lg" color="blue" />
      </motion.div>
      
      <motion.p 
        className="text-gray-600 dark:text-gray-400 text-lg font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Đang tải dữ liệu...
      </motion.p>
      
      <motion.div 
        className="text-sm text-gray-500 dark:text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Vui lòng đợi trong giây lát
      </motion.div>
    </motion.div>
  );
};

// Error Component
export const ErrorDisplay = ({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry?: () => void;
}) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          delay: 0.1,
          type: "spring",
          stiffness: 200 
        }}
      >
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </motion.div>
      
      <motion.h3 
        className="text-xl font-semibold text-gray-900 dark:text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Oops! Có lỗi xảy ra
      </motion.h3>
      
      <motion.p 
        className="text-gray-600 dark:text-gray-400 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {message}
      </motion.p>
      
      {onRetry && (
        <motion.button
          onClick={onRetry}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Thử lại
        </motion.button>
      )}
    </motion.div>
  );
};

// Shimmer Loading Effect
export const ShimmerEffect = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 ${className}`}>
      <motion.div
        className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

// Original Loading Component for backward compatibility
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray';
  text?: string;
  className?: string;
}

const Loading = ({ 
  size = 'md', 
  color = 'blue', 
  text = 'Đang tải...', 
  className = '' 
}: LoadingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <div 
        className={`animate-spin rounded-full border-2 border-gray-200 ${colorClasses[color]} border-t-transparent ${sizeClasses[size]}`}
      ></div>
      {text && (
        <p className={`mt-4 text-gray-600 dark:text-gray-400 ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;
