import { dataProcessor } from "./dataProcessor";
import type { CourseWithInstructor, FilterOptions } from "./dataProcessor";

// Mock delay to simulate network latency for realistic user experience
const mockDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to convert dataProcessor results to API Course format
const convertToApiCourse = (course: CourseWithInstructor): Course => {
  return {
    id: course.id,
    slug: course.slug || course.id.toString(),
    title: course.title,
    price: course.price,
    currency: course.currency || "VND",
    category: course.category,
    instructor_id: course.instructor.id,
    description: course.description,
    thumbnail_url: course.thumbnail_url,
    instructor: {
      id: course.instructor.id,
      fullname: course.instructor.fullname,
      avatar: course.instructor.avatar,
      bio_snippet: course.instructor.bio_snippet,
    },
    rating: course.rating,
    number_of_reviews: course.number_of_reviews,
    is_bestseller: course.is_bestseller === 1 ? 1 : 0,
    is_new: course.is_new === 1 ? 1 : 0,
    discount_price: course.discount_price,
    level: course.level,
    duration_hours: course.duration_hours,
    number_of_lectures: course.number_of_lectures,
  };
};

// Mock API functions using dataProcessor
const mockApi = {
  // Get all courses with pagination
  async getAllCourses(page = 1, limit = 20): Promise<Course[]> {
    await mockDelay(300);
    console.log("📊 Using mock data for getAllCourses");

    const result = dataProcessor.getCourses({ page, limit });
    return result.courses.map(convertToApiCourse);
  },

  // Get courses with pagination info
  async getCoursesWithPagination(
    page = 1,
    limit = 20
  ): Promise<{ courses: Course[]; pagination: any }> {
    await mockDelay(300);
    console.log("📊 Using mock data for getCoursesWithPagination");

    const result = dataProcessor.getCourses({ page, limit });
    return {
      courses: result.courses.map(convertToApiCourse),
      pagination: result.pagination,
    };
  },

  // Search courses
  async searchCourses(query: string): Promise<Course[]> {
    await mockDelay(400);
    console.log("🔍 Using mock data for searchCourses:", query);

    const results = dataProcessor.searchCourses(query);
    return results.map(convertToApiCourse);
  },

  // Get featured courses
  async getFeaturedCourses(limit = 4): Promise<Course[]> {
    await mockDelay(200);
    console.log("⭐ Using mock data for getFeaturedCourses");

    const results = dataProcessor.getFeaturedCourses(limit);
    return results.map(convertToApiCourse);
  },

  // Get courses by category
  async getCoursesByCategory(category: string): Promise<Course[]> {
    await mockDelay(300);
    console.log("📂 Using mock data for getCoursesByCategory:", category);

    const result = dataProcessor.getCourses({ category });
    return result.courses.map(convertToApiCourse);
  },

  // Get course by ID
  async getCourseById(id: string) {
    await mockDelay(200);
    console.log("📖 Using mock data for getCourseById:", id);

    const course = dataProcessor.getCourseById(id);
    if (!course) return null;

    return {
      ...convertToApiCourse(course),
      instructor: course.instructor,
      reviews: course.reviews,
      related_courses: course.related_courses.map(convertToApiCourse),
      stats: course.stats,
    };
  },

  // Get categories
  async getCategories() {
    await mockDelay(100);
    console.log("📋 Using mock data for getCategories");

    return dataProcessor.getCategoryData();
  },

  // Get instructors
  async getInstructors() {
    await mockDelay(200);
    console.log("👨‍🏫 Using mock data for getInstructors");

    return dataProcessor.getAllInstructors();
  },

  // Get instructor by ID
  async getInstructorById(id: string) {
    await mockDelay(150);
    console.log("👨‍🏫 Using mock data for getInstructorById:", id);

    return dataProcessor.getInstructorWithCourses(id);
  },

  // Get stats
  async getStats() {
    await mockDelay(100);
    console.log("📊 Using mock data for getStats");

    return dataProcessor.getStats();
  },

  // Health check
  async checkHealth(): Promise<ApiStatus> {
    await mockDelay(50);
    console.log("💚 Mock API health check");

    const stats = dataProcessor.getStats();
    return {
      status: "OK" as const,
      timestamp: new Date().toISOString(),
      data_loaded: {
        courses: stats.total_courses,
        instructors: stats.total_instructors,
        reviews: stats.total_reviews,
        users: stats.total_students,
      },
    };
  },

  // Get sub-categories
  async getSubCategories(category?: string) {
    await mockDelay(100);
    console.log("📑 Using mock data for getSubCategories");

    // Filter courses by main category if provided
    let coursesToProcess = category
      ? dataProcessor.getCourses({ category }).courses
      : dataProcessor.getCourses().courses;

    // Extract unique sub-categories
    const subCategories = [
      ...new Set(
        coursesToProcess
          .map((course) => (course as any).sub_category)
          .filter(Boolean)
      ),
    ].map((subCat) => ({
      name: subCat,
      category: category || "all",
      course_count: coursesToProcess.filter(
        (c) => (c as any).sub_category === subCat
      ).length,
    }));

    return subCategories;
  },

  async filterCourses(options: AdvancedFilterOptions = {}) {
    await mockDelay(400);
    console.log("🔍 Using mock data for filterCourses with options:", options);

    const {
      q, 
      category,
      level,
      rating,
      page = 1,
      limit = 12,
      sort = "title",
      min_price = 0,
      max_price = 5000000
    } = options;

    // Get initial courses
    let result = dataProcessor.getCourses({
      category,
      level,
      rating,
      page,
      limit,
      sort,
      q,
      minPrice: min_price,
      maxPrice: max_price
    });

    return {
      courses: result.courses.map(convertToApiCourse),
      pagination: result.pagination,
      stats: {
        total_found: result.pagination.total_courses
      }
    };
  },

  // Get price range statistics
  async getPriceRange() {
    await mockDelay(100);
    console.log("💰 Using mock data for getPriceRange");

    const prices = dataProcessor
      .getCourses()
      .courses.map((course) => course.discount_price || course.price)
      .filter((price) => price > 0);

    if (prices.length === 0) {
      return {
        min: 0,
        max: 0,
        average: 0,
        ranges: {
          free: 0,
          under_500k: 0,
          "500k_1m": 0,
          "1m_2m": 0,
          over_2m: 0,
        },
      };
    }

    const courses = dataProcessor.getCourses().courses;

    const priceStats = {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: Math.round(
        prices.reduce((sum, price) => sum + price, 0) / prices.length
      ),
      ranges: {
        free: courses.filter((c) => (c.discount_price || c.price) === 0).length,
        under_500k: courses.filter((c) => {
          const price = c.discount_price || c.price;
          return price < 500000 && price > 0;
        }).length,
        "500k_1m": courses.filter((c) => {
          const price = c.discount_price || c.price;
          return price >= 500000 && price < 1000000;
        }).length,
        "1m_2m": courses.filter((c) => {
          const price = c.discount_price || c.price;
          return price >= 1000000 && price < 2000000;
        }).length,
        over_2m: courses.filter((c) => (c.discount_price || c.price) >= 2000000)
          .length,
      },
    };

    return priceStats;
  },
};

// Course interface
export interface Course {
  id: string;
  title: string;
  slug?: string;
  category: string;
  sub_category?: string;
  level: string;
  instructor_id: string;
  price: number;
  currency?: string;
  discount_price?: number | null;
  description: string;
  learning_outcomes?: string[];
  what_you_will_learn?: string[];
  requirements?: string[];
  duration_hours: number;
  number_of_lectures: number;
  rating: number;
  number_of_reviews: number;
  is_bestseller: number;
  is_new: number;
  thumbnail_url: string;
  preview_video_url?: string;
  last_updated?: string;
  related_topics?: string[];
  language?: string;
  certifiable?: number;
  instructor: {
    id?: string;
    fullname?: string;
    avatar?: string;
    bio_snippet: string;
  };
}

export interface CourseWithDetails extends Course {
  reviews: ReviewWithUser[];
  related_courses: Course[];
  stats: {
    total_reviews: number;
    average_rating: number;
  };
}

export interface ReviewWithUser {
  id: number;
  course_id: string;
  user_id: number;
  rating: number;
  comment: string;
  date: string;
  user: {
    id: number;
    username: string;
    fullname: string;
    avatar: string;
  };
}

// Cập nhật interface cho filter options
export interface AdvancedFilterOptions extends FilterOptions {
  sub_category?: string;
  min_price?: number;
  max_price?: number;
  instructor_id?: string;
  certifiable?: number;
  is_bestseller?: number;
  is_new?: number;
  language?: string;
  last_updated?: string;
}

// API Response interface - More flexible
export interface CoursesResponse {
  courses?: Course[];
  data?: Course[];
  success?: boolean;
  message?: string;
  total?: number;
  pagination?: {
    current_page: number;
    total_pages: number;
    total_courses: number;
    per_page: number;
  };
  [key: string]: any; // Allow additional properties
}

// API Status interface
export interface ApiStatus {
  status: "OK" | "ERROR";
  timestamp: string;
  data_loaded?: {
    courses: number;
    instructors: number;
    reviews: number;
    users: number;
  };
}

// Interface cho options lọc nâng cao
export interface AdvancedFilterOptions extends FilterOptions {
  sub_category?: string;
  min_price?: number;
  max_price?: number;
  instructor_id?: string;
}

// API service functions using only mock data
export const coursesService = {
  // Get all courses with pagination support
  getAllCourses: async (page = 1, limit = 20): Promise<Course[]> => {
    return mockApi.getAllCourses(page, limit);
  },

  // Get courses with full pagination info
  getCoursesWithPagination: async (
    page = 1,
    limit = 20
  ): Promise<{ courses: Course[]; pagination: any }> => {
    return mockApi.getCoursesWithPagination(page, limit);
  },

  // Get courses by category
  getCoursesByCategory: async (category: string): Promise<Course[]> => {
    return mockApi.getCoursesByCategory(category);
  },

  // Search courses
  searchCourses: async (query: string): Promise<Course[]> => {
    return mockApi.searchCourses(query);
  },

  // Get featured courses
  getFeaturedCourses: async (limit = 4): Promise<Course[]> => {
    return mockApi.getFeaturedCourses(limit);
  },

  // Get course statistics
  getStats: async () => {
    return mockApi.getStats();
  },

  // Get categories
  getCategories: async () => {
    return mockApi.getCategories();
  },

  // Get instructors
  getInstructors: async () => {
    return mockApi.getInstructors();
  },

  // Get course by ID
  getCourseById: async (id: string) => {
    return mockApi.getCourseById(id);
  },

  // Get instructor by ID
  getInstructorById: async (id: string) => {
    return mockApi.getInstructorById(id);
  },

  // Health check
  checkHealth: async (): Promise<ApiStatus> => {
    return mockApi.checkHealth();
  },

  // Get sub-categories
  getSubCategories: async (category?: string) => {
    return mockApi.getSubCategories(category);
  },

  // Advanced filter with multiple criteria
  filterCourses: async (options: AdvancedFilterOptions = {}) => {
    return mockApi.filterCourses(options);
  },

  // Get price range statistics
  getPriceRange: async () => {
    return mockApi.getPriceRange();
  },
};

// Individual API functions for direct use
export const getAllCourses = async (): Promise<Course[]> => {
  return coursesService.getAllCourses();
};

export const getFeaturedCourses = async (limit = 4): Promise<Course[]> => {
  return coursesService.getFeaturedCourses(limit);
};

export const searchCourses = async (query: string): Promise<Course[]> => {
  return coursesService.searchCourses(query);
};

// Lấy thông tin các khóa học theo danh mục
export const getCoursesByCategory = async (
  category: string
): Promise<Course[]> => {
  return coursesService.getCoursesByCategory(category);
};

// Lấy thông tin chi tiết khóa học theo ID
export const getCourseById = async (id: string) => {
  return coursesService.getCourseById(id);
};

// Lấy danh sách danh mục
export const getCategories = async () => {
  return coursesService.getCategories();
};

// Lấy danh sách giảng viên
export const getInstructors = async () => {
  return coursesService.getInstructors();
};

// Lấy thông tin giảng viên theo ID
export const getInstructorById = async (id: string) => {
  return coursesService.getInstructorById(id);
};

// Lấy thống kê tổng quan
export const getStats = async () => {
  return coursesService.getStats();
};

// Kiểm tra tình trạng API
export const checkHealth = async (): Promise<ApiStatus> => {
  return coursesService.checkHealth();
};

// Lấy subcategories
export const getSubCategories = async (category?: string) => {
  return coursesService.getSubCategories(category);
};

// Lấy thông tin khoảng giá
export const getPriceRange = async () => {
  return coursesService.getPriceRange();
};

// Lọc khóa học theo nhiều tiêu chí nâng cao
export const filterCourses = async (options: AdvancedFilterOptions = {}) => {
  return coursesService.filterCourses(options);
};

// Export default API service
export default coursesService;