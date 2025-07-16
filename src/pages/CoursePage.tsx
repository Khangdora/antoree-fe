import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { dataProcessor } from "../services/dataProcessor";
import type { CourseWithDetails } from "../services/dataProcessor";
import { useFavorites } from "../hooks/useFavorites";
import { AIAnalysisButton } from "../components/ui/AIAnalysisButton";
import { useViewHistory } from "../hooks/useViewHistory";

const CoursePage = () => {
  const { slug } = useParams();
  const [course, setCourse] = useState<CourseWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [isAnimatingHeart, setIsAnimatingHeart] = useState(false);

  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const { addToViewHistory } = useViewHistory();

  useEffect(() => {
    const loadCourse = async () => {
      setIsLoading(true);
      try {
        // Tìm course bằng slug
        const allCourses = dataProcessor.getAllCourses();
        const foundCourse = allCourses.find((c) => c.slug === slug);

        if (foundCourse) {
          const courseDetails = dataProcessor.getCourseById(foundCourse.id);
          setCourse(courseDetails);
          
          // Thêm vào lịch sử xem
          addToViewHistory(foundCourse.id);
        }
      } catch (error) {
        console.error("Error loading course:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [slug, addToViewHistory]);

  useEffect(() => {
    const loadCourse = async () => {
      setIsLoading(true);
      try {
        // Tìm course bằng slug
        const allCourses = dataProcessor.getAllCourses();
        const foundCourse = allCourses.find((c) => c.slug === slug);

        if (foundCourse) {
          const courseDetails = dataProcessor.getCourseById(foundCourse.id);
          setCourse(courseDetails);
        }
      } catch (error) {
        console.error("Error loading course:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [slug]);

  const getCategoryLink = (categoryName: string) => {
    const category = dataProcessor.getCategoryByName(categoryName);
    return category
      ? `/filter?category=${encodeURIComponent(category.id)}`
      : "/filter";
  };

  const handleThumbnailClick = () => {
    if (course?.preview_video_url) {
      setIsPlayingVideo(true);
    }
  };

  const handleToggleFavorite = async () => {
    if (!course) return;

    setIsAnimatingHeart(true);

    if (isFavorite(course.id)) {
      await removeFavorite(course.id);
    } else {
      await addFavorite(course.id);
    }

    setTimeout(() => setIsAnimatingHeart(false), 300);
  };

  const formatPrice = (price: number, currency: string = "VND") => {
    if (currency === "VND") {
      return price.toLocaleString("vi-VN") + "đ";
    }
    return `${currency} ${price.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Không tìm thấy khóa học
          </h1>
          <Link
            to="/courses"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Xem các khóa học khác
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${course.title} | AnToRee`}</title>
        <meta name="description" content={course.description} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Course Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Left Column - Video/Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-xl overflow-hidden aspect-video group"
            >
              {course.preview_video_url && isPlayingVideo ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full"
                >
                  <iframe
                    className="w-full h-full"
                    src={`${course.preview_video_url}?autoplay=1`}
                    title={course.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <button
                    onClick={() => setIsPlayingVideo(false)}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
                    aria-label="Close video"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </motion.div>
              ) : (
                <div
                  className="relative cursor-pointer group"
                  onClick={handleThumbnailClick}
                >
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                  />
                  {course.preview_video_url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="relative z-10 w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/40 transition-colors"
                      >
                        <svg
                          className="w-8 h-8 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.div>
                      <span className="absolute bottom-4 left-4 text-white font-medium bg-black/50 px-3 py-1 rounded-lg text-sm">
                        Xem video giới thiệu
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Right Column - Course Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col h-full justify-between"
            >
              <div className="space-y-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  {course.title}
                </h1>

                <div className="flex items-center gap-4">
                  <Link
                    to={getCategoryLink(course.category)}
                    className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-1">
                      <span>{course.category}</span>
                      <svg
                        className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                  <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                    {course.level}
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(course.rating)
                            ? "text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                      {course.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    ({course.number_of_reviews.toLocaleString()} đánh giá)
                  </span>
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(course.price)}
                    </div>
                    {course.discount_price && (
                      <div>
                        <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                          {formatPrice(course.price)}
                        </span>
                        <span className="ml-2 text-sm text-green-600 dark:text-green-400 font-medium">
                          (Tiết kiệm{" "}
                          {Math.round(
                            (1 - course.discount_price / course.price) * 100
                          )}
                          %)
                        </span>
                      </div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleFavorite}
                    className={`p-3 rounded-full ${
                      isFavorite(course.id)
                        ? "bg-red-100 text-red-500 dark:bg-red-900/30"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    <motion.svg
                      animate={isAnimatingHeart ? { scale: [1, 1.2, 1] } : {}}
                      className="w-6 h-6"
                      fill={isFavorite(course.id) ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </motion.svg>
                  </motion.button>
                </div>

                <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
                  Đăng ký ngay
                </button>
              </div>
            </motion.div>
          </div>

          {/* Course Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Description */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Giới thiệu khóa học
                  </h2>
                </div>
                <p><AIAnalysisButton course={course} /></p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {course.description}
                </p>
              </motion.section>

              {/* What you'll learn */}
              {course.learning_outcomes && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Bạn sẽ học được gì
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.learning_outcomes.map((outcome, index) => (
                      <div key={index} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-500 mr-3 mt-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300">
                          {outcome}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Reviews */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Đánh giá từ học viên
                </h2>
                <div className="space-y-6">
                  {course.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0"
                    >
                      <div className="flex items-start">
                        <img
                          src={review.user.avatar}
                          alt={review.user.fullname}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {review.user.fullname}
                            </h4>
                            <span className="mx-2 text-gray-300 dark:text-gray-600">
                              •
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(review.date).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center mt-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Instructor Info */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Giảng viên
                </h2>
                <div className="flex items-center">
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.fullname}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {course.instructor.fullname}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {course.instructor.bio_snippet}
                    </p>
                  </div>
                </div>
              </motion.section>

              {/* Course Stats */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Thông tin khóa học
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">
                      {course.duration_hours} giờ học
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-300">
                      {course.number_of_lectures} bài giảng
                    </span>
                  </div>
                </div>
              </motion.section>

              {/* Related Courses */}
              {course.related_courses.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Khóa học liên quan
                  </h2>
                  <div className="space-y-4">
                    {course.related_courses.map((relatedCourse) => (
                      <Link
                        key={relatedCourse.id}
                        to={`/course/${relatedCourse.slug}`}
                        className="block group"
                      >
                        <div className="flex items-center">
                          <img
                            src={relatedCourse.thumbnail_url}
                            alt={relatedCourse.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="ml-4">
                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {relatedCourse.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatPrice(relatedCourse.price)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.section>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursePage;