import coursesData from '../data/courses.json';
import instructorsData from '../data/instructors.json';
import reviewsData from '../data/course_reviews.json';
import usersData from '../data/users.json';
import categoriesData from '../data/categories.json';
import type { Course } from './api';

export interface Instructor {
  id: string;
  fullname: string;
  avatar: string;
  bio_snippet: string;
}

export interface Review {
  id: number;
  course_id: string;
  user_id: number;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  id: number;
  username: string;
  fullname: string;
  avatar: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  featured?: boolean;
  subcategories?: string[];
}

export interface CourseWithInstructor extends Course {
  instructor: Instructor;
}

export interface CourseWithDetails extends CourseWithInstructor {
  reviews: ReviewWithUser[];
  related_courses: CourseWithInstructor[];
  stats: {
    total_reviews: number;
    average_rating: number;
  };
}

export interface ReviewWithUser extends Review {
  user: User;
}

export interface PaginationResult {
  courses: CourseWithInstructor[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_courses: number;
    per_page: number;
  };
}

export interface FilterOptions {
  q?: string;
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  page?: number;
  limit?: number;
  sort?: 'title' | 'price' | 'rating' | 'date' | 'popularity';
}

function normalizeText(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function getSearchScore(course: Course, query: string, terms: string[]): number {
  let score = 0;
  const title = normalizeText(course.title);
  const desc = normalizeText(course.description);

  // Exact title match gets highest score
  if (title === query) score += 15;
  
  // Title contains query
  if (title.includes(query)) score += 10;
  
  // Description contains query
  if (desc.includes(query)) score += 4;

  // Check title words for partial matches
  const titleWords = title.split(/\s+/);
  for (const word of titleWords) {
    if (word.startsWith(query)) score += 5;
    else if (word.includes(query)) score += 3;
  }

  // Check individual search terms
  for (const term of terms) {
    if (term.length < 2) continue;
    if (title.includes(term)) score += 4;
    if (desc.includes(term)) score += 2;
  }

  return score;
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Data Processor Class - Xử lý dữ liệu frontend
 */
class DataProcessor {
  private courses: Course[] = [];
  private instructors: Instructor[] = [];
  private reviews: Review[] = [];
  private users: User[] = [];
  private categories: Category[] = [];

  constructor() {
    this.loadData();
  }

  /**
   * Load và validate dữ liệu từ JSON files
   */
  private loadData() {
    try {
      // Filter valid courses
    this.courses = (coursesData as Course[])
      .filter(course => course && course.id && course.title)
      .map(course => ({
        ...course,
        slug: course.slug || createSlug(course.title) 
      }));
      
      this.instructors = instructorsData as Instructor[];
      this.reviews = reviewsData as Review[];
      this.users = usersData as User[];
      this.categories = categoriesData.allCategories as Category[];

      console.log(`📊 Data loaded: ${this.courses.length} courses, ${this.instructors.length} instructors, ${this.reviews.length} reviews, ${this.users.length} users`);
    } catch (error) {
      console.error('❌ Error loading data:', error);
    }
  }

  /**
   * Lấy instructor theo ID
   */
  getInstructorById(instructorId: string): Instructor | undefined {
    return this.instructors.find(instructor => instructor.id === instructorId);
  }

  /**
   * Lấy user theo ID
   */
  getUserById(userId: number): User | undefined {
    return this.users.find(user => user.id === userId);
  }

  /**
   * Thêm thông tin instructor vào course
   */
  private enrichCourseWithInstructor(course: Course): CourseWithInstructor {
    const instructor = this.getInstructorById(course.instructor_id);
    return {
      ...course,
      instructor: instructor || {
        id: course.instructor_id,
        fullname: 'Unknown Instructor',
        avatar: 'https://via.placeholder.com/150',
        bio_snippet: 'Instructor information not available.'
      }
    };
  }

  /**
   * Tìm kiếm courses với nhiều tiêu chí
   */
  searchCourses(query: string, options: Omit<FilterOptions, 'q'> = {}): CourseWithInstructor[] {
    if (!query.trim()) return [];

    const lowercaseQuery = query.toLowerCase().trim();
    
    let results = this.courses.filter(course => {
      const instructor = this.getInstructorById(course.instructor_id);
      
      return (
        course.title.toLowerCase().includes(lowercaseQuery) ||
        course.description.toLowerCase().includes(lowercaseQuery) ||
        course.category.toLowerCase().includes(lowercaseQuery) ||
        course.sub_category?.toLowerCase().includes(lowercaseQuery) ||
        instructor?.fullname.toLowerCase().includes(lowercaseQuery) ||
        course.related_topics?.some(topic => 
          topic.toLowerCase().includes(lowercaseQuery)
        )
      );
    });

    // Apply additional filters
    results = this.applyFilters(results, options);

    // Sort results
    results = this.sortCourses(results, options.sort || 'title');

    // Add instructor info
    return results.map(course => this.enrichCourseWithInstructor(course));
  }

  /**
   * Lấy tất cả courses 
   */
  getAllCourses(): CourseWithInstructor[] {
    return this.courses.map(course => this.enrichCourseWithInstructor(course));
  }

  /**
   * Lấy tất cả courses với filter và pagination
   */
  getCourses(options: FilterOptions = {}): PaginationResult {
    const {
      page = 1,
      limit = 12,
      sort = 'title',
      q = '',
      minPrice,
      maxPrice,
    } = options;

    // Start with all courses
    let filtered = [...this.courses];

    // Apply search if query exists
    if (q) {
      const normalizedQuery = normalizeText(q);
      const searchTerms = normalizedQuery.split(/\s+/);

      // Map courses with search scores
      const scoredCourses = filtered
        .map(course => ({
          course,
          score: getSearchScore(course, normalizedQuery, searchTerms)
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score);

      // Get only the courses from scored results
      filtered = scoredCourses.map(({ course }) => course);
    }

    // Apply filters
    filtered = this.applyFilters(filtered, {
      ...options,
      minPrice,
      maxPrice
    });

    // Sort courses
    filtered = this.sortCourses(filtered, sort);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCourses = filtered.slice(startIndex, endIndex);

    // Add instructor info
    const coursesWithInstructors = paginatedCourses.map(course => 
      this.enrichCourseWithInstructor(course)
    );

    return {
      courses: coursesWithInstructors,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(filtered.length / limit),
        total_courses: filtered.length,
        per_page: limit
      }
    };
  }

  /**
   * Apply các filter lên danh sách courses
   */
  private applyFilters(courses: Course[], options: Omit<FilterOptions, 'page' | 'limit' | 'sort' | 'q'>): Course[] {
    const {
      category,
      level,
      minPrice = 0,
      maxPrice = 5000000,
      rating
    } = options;

    return courses.filter(course => {
      // Category filter
      if (category && course.category !== category) return false;

      // Level filter
      if (level && course.level !== level) return false;

      // Price range filter
      const coursePrice = course.discount_price || course.price;
      if (coursePrice < minPrice || coursePrice > maxPrice) return false;

      // Rating filter
      if (rating !== undefined && course.rating < rating) return false;

      return true;
    });
  }

  /**
   * Sort courses theo tiêu chí
   */
  private sortCourses(courses: Course[], sortBy: string): Course[] {
    return [...courses].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.discount_price || a.price) - (b.discount_price || b.price);
        case 'price_desc':
          return (b.discount_price || b.price) - (a.discount_price || a.price);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'reviews':
          return (b.number_of_reviews || 0) - (a.number_of_reviews || 0);
        case 'date':
          return new Date(b.last_updated || '').getTime() - new Date(a.last_updated || '').getTime();
        case 'popularity':
          // Sort by combination of rating and reviews
          const aScore = (a.rating || 0) * Math.log(a.number_of_reviews + 1);
          const bScore = (b.rating || 0) * Math.log(b.number_of_reviews + 1);
          return bScore - aScore;
        case 'title':
        default:
          return a.title.localeCompare(b.title, 'vi', { sensitivity: 'base' });
      }
    });
  }

  /**
   * Lấy featured/bestseller courses
   */
  getFeaturedCourses(limit: number = 8): CourseWithInstructor[] {
    const featuredCourses = this.courses
      .filter(course => course.is_bestseller === 1 || (course.rating || 0) >= 4.8)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);

    return featuredCourses.map(course => this.enrichCourseWithInstructor(course));
  }

  /**
   * Lấy course detail theo ID
   */
  getCourseById(courseId: string): CourseWithDetails | null {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return null;

    const instructor = this.getInstructorById(course.instructor_id);
    const courseReviews = this.reviews.filter(r => r.course_id === course.id);
    
    // Add user info to reviews
    const reviewsWithUsers: ReviewWithUser[] = courseReviews.map(review => ({
      ...review,
      user: this.getUserById(review.user_id) || {
        id: review.user_id,
        username: 'unknown',
        fullname: 'Anonymous User',
        avatar: 'https://via.placeholder.com/50'
      }
    }));

    // Get related courses (same category, different course)
    const relatedCourses = this.courses
      .filter(c => c.category === course.category && c.id !== course.id)
      .slice(0, 4)
      .map(relatedCourse => this.enrichCourseWithInstructor(relatedCourse));

    return {
      ...course,
      instructor: instructor || {
        id: course.instructor_id,
        fullname: 'Unknown Instructor',
        avatar: 'https://via.placeholder.com/150',
        bio_snippet: 'Instructor information not available.'
      },
      reviews: reviewsWithUsers,
      related_courses: relatedCourses,
      stats: {
        total_reviews: courseReviews.length,
        average_rating: courseReviews.length > 0 
          ? courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length 
          : 0
      }
    };
  }

  /**
   * Lấy tất cả categories
   */
  getCategories(): string[] {
    return [...new Set(this.courses.map(course => course.category).filter(Boolean))];
  }

  /**
   * Get category ID by name
   */
  getCategoryIdByName(categoryName: string): string | null {
    const category = this.categories.find(c => c.name === categoryName);
    return category ? category.id : null;
  }

  /**
   * Get category by name
   */
  getCategoryByName(categoryName: string): Category | null {
    return this.categories.find(c => c.name === categoryName) || null;
  }

  /**
   * Lấy category data với thông tin chi tiết
   */
  getCategoryData(): Category[] {
    return this.categories;
  }

  /**
   * Lấy tất cả levels
   */
  getLevels(): string[] {
    return [...new Set(this.courses.map(course => course.level).filter(Boolean))];
  }

  /**
   * Lấy price range statistics
   */
  getPriceRange(): { min: number; max: number; average: number } {
    const prices = this.courses.map(course => course.discount_price || course.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((sum, price) => sum + price, 0) / prices.length
    };
  }

  /**
   * Lấy instructor với courses của họ
   */
  getInstructorWithCourses(instructorId: string) {
    const instructor = this.getInstructorById(instructorId);
    if (!instructor) return null;

    const instructorCourses = this.courses.filter(c => c.instructor_id === instructor.id);
    const allReviews = this.reviews.filter(r => 
      instructorCourses.some(course => course.id === r.course_id)
    );

    return {
      ...instructor,
      courses: instructorCourses.map(course => this.enrichCourseWithInstructor(course)),
      stats: {
        total_courses: instructorCourses.length,
        total_students: instructorCourses.reduce((sum, course) => sum + (course.number_of_reviews || 0), 0),
        total_reviews: allReviews.length,
        average_rating: allReviews.length > 0
          ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
          : 0
      }
    };
  }

  /**
   * Lấy tất cả instructors với thống kê
   */
  getAllInstructors() {
    return this.instructors.map(instructor => {
      const instructorCourses = this.courses.filter(c => c.instructor_id === instructor.id);
      const allReviews = this.reviews.filter(r => 
        instructorCourses.some(course => course.id === r.course_id)
      );

      return {
        ...instructor,
        course_count: instructorCourses.length,
        total_students: instructorCourses.reduce((sum, course) => sum + (course.number_of_reviews || 0), 0),
        average_rating: allReviews.length > 0
          ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
          : 0
      };
    });
  }

  /**
   * Lấy thống kê tổng quan
   */
  getStats() {
    const totalReviews = this.reviews.length;
    const averageRating = totalReviews > 0 
      ? this.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    return {
      total_courses: this.courses.length,
      total_instructors: this.instructors.length,
      total_students: this.courses.reduce((sum, course) => sum + (course.number_of_reviews || 0), 0),
      total_reviews: totalReviews,
      average_rating: Number(averageRating.toFixed(1)),
      categories_count: this.getCategories().length,
      featured_courses: this.courses.filter(course => course.is_bestseller === 1).length
    };
  }

  /**
   * Utility function - Format price
   */
  formatPrice(price: number, currency: string = 'VND'): string {
    if (currency === 'VND') {
      return price.toLocaleString('vi-VN') + 'đ';
    }
    return price.toLocaleString('en-US', { style: 'currency', currency });
  }

  /**
   * Utility function - Get category icon
   */
  getCategoryIcon(category: string): string {
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
  }
}

// Create singleton instance
export const dataProcessor = new DataProcessor();

// Export individual functions for convenience
export const {
  searchCourses,
  getCourses,
  getAllCourses,
  getFeaturedCourses,
  getCourseById,
  getCategories,
  getCategoryData,
  getLevels,
  getPriceRange,
  getInstructorWithCourses,
  getAllInstructors,
  getStats,
  formatPrice,
  getCategoryIcon,
  getCategoryIdByName,
  getCategoryByName
} = dataProcessor;

export default dataProcessor;
