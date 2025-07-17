import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../../services/api';

interface CourseDetailModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

const CourseDetailModal = ({ course, isOpen, onClose }: CourseDetailModalProps) => {
  const formatPrice = (price: number, currency?: string) => {
    if (currency === 'VND' || !currency) {
      return price.toLocaleString('vi-VN') + 'đ';
    }
    return `${currency} ${price.toLocaleString()}`;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all relative">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 group z-1 cursor-pointer"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white transition-colors"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column - Image and Gallery */}
                  <div className="space-y-6">
                    <div className="relative rounded-xl overflow-hidden aspect-video group">
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Course highlights */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center p-4 bg-blue-50 dark:bg-gray-700/50 rounded-xl hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Thời lượng</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {course.duration_hours} giờ học
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center p-4 bg-blue-50 dark:bg-gray-700/50 rounded-xl hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Bài giảng</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {course.number_of_lectures} bài
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Course Info */}
                  <div className="space-y-6">
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-2xl font-bold text-gray-900 dark:text-white mb-3 mr-[30px]"
                      >
                        {course.title}
                      </Dialog.Title>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                          {course.category}
                        </span>
                        <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                          {course.level}
                        </span>
                      </div>
                    </div>

                    {/* Rating section */}
                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(course.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
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
                        ({course.number_of_reviews} đánh giá)
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Enhanced What you'll learn section */}
                    {course.learning_outcomes && (
                      <div className="space-y-4 bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                          Bạn sẽ học được gì:
                        </h4>
                        <ul className="space-y-3">
                          {course.learning_outcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start group">
                              <svg
                                className="w-5 h-5 text-green-500 mr-3 mt-0.5 group-hover:scale-110 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span className="text-gray-700 dark:text-gray-300">
                                {outcome}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Enhanced Price and CTA */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(course.price)}
                          </span>
                          {course.discount_price && (
                            <div>
                              <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                                {formatPrice(course.price)}
                              </span>
                              <span className="ml-2 text-sm text-green-600 dark:text-green-400 font-medium">
                                (Tiết kiệm {Math.round((1 - course.discount_price / course.price) * 100)}%)
                              </span>
                            </div>
                          )}
                        </div>
                        <Link
                          to={`/course/${course.slug}`}
                          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        >
                          <span className="font-medium">Đăng ký ngay</span>
                          <svg
                            className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
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
                      </div>
                    </div>

                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CourseDetailModal;