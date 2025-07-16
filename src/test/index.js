// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Load mock data with error handling
let courses = [];
let instructors = [];
let reviews = [];
let users = [];

try {
  courses = require('./mock-data/courses.json').filter(course => 
    course && course.id && course.title
  );
  instructors = require('./mock-data/instructors.json');
  reviews = require('./mock-data/course_reviews.json');
  users = require('./mock-data/users.json');
  
  console.log(`Loaded: ${courses.length} courses, ${instructors.length} instructors, ${reviews.length} reviews, ${users.length} users`);
} catch (error) {
  console.error('Error loading mock data:', error.message);
}

// Get all courses with filtering and pagination
app.get('/api/courses', (req, res) => {
  try {
    const { 
      q = '', 
      category = '', 
      level = '', 
      page = 1, 
      limit = 12,
      sort = 'title'
    } = req.query;

    let filtered = courses.filter(course => {
      const matchSearch = !q || 
        course.title?.toLowerCase().includes(q.toLowerCase()) ||
        course.description?.toLowerCase().includes(q.toLowerCase()) ||
        course.category?.toLowerCase().includes(q.toLowerCase());
      
      const matchCategory = !category || course.category === category;
      const matchLevel = !level || course.level === level;
      
      return matchSearch && matchCategory && matchLevel;
    });

    // Sort courses
    filtered.sort((a, b) => {
      switch (sort) {
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'reviews':
          return (b.number_of_reviews || 0) - (a.number_of_reviews || 0);
        default:
          return (a.title || '').localeCompare(b.title || '');
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCourses = filtered.slice(startIndex, endIndex);

    // Add instructor info to each course
    const coursesWithInstructors = paginatedCourses.map(course => {
      const instructor = instructors.find(i => i.id === course.instructor_id);
      const courseReviewCount = reviews.filter(r => r.course_id === course.id).length;
      
      return {
        ...course,
        instructor: instructor ? {
          id: instructor.id,
          fullname: instructor.fullname,
          avatar: instructor.avatar
        } : null,
        actual_review_count: courseReviewCount
      };
    });

    res.json({
      courses: coursesWithInstructors,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(filtered.length / limit),
        total_courses: filtered.length,
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get featured/bestseller courses - MUST BE BEFORE /:id route
app.get('/api/courses/featured', (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const featuredCourses = courses
      .filter(course => course.is_bestseller === 1 || course.rating >= 4.8)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, parseInt(limit))
      .map(course => {
        const instructor = instructors.find(i => i.id === course.instructor_id);
        return {
          ...course,
          instructor: instructor ? {
            id: instructor.id,
            fullname: instructor.fullname,
            avatar: instructor.avatar,
            bio_snippet: instructor.bio_snippet || ''
          } : {
            id: null,
            fullname: 'Giảng viên',
            avatar: null,
            bio_snippet: ''
          }
        };
      });

    // Return as array for easier handling
    res.json(featuredCourses);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get course detail by ID - MUST BE AFTER /featured route
app.get('/api/courses/:id', (req, res) => {
  try {
    const course = courses.find(c => c.id === req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const instructor = instructors.find(i => i.id === course.instructor_id);
    const courseReviews = reviews.filter(r => r.course_id === course.id);
    
    // Add user info to reviews
    const reviewsWithUsers = courseReviews.map(review => {
      const user = users.find(u => u.id === review.user_id);
      return {
        ...review,
        user: user ? {
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          avatar: user.avatar
        } : null
      };
    });

    // Get related courses (same category, different course)
    const relatedCourses = courses
      .filter(c => c.category === course.category && c.id !== course.id)
      .slice(0, 4)
      .map(relatedCourse => {
        const relatedInstructor = instructors.find(i => i.id === relatedCourse.instructor_id);
        return {
          ...relatedCourse,
          instructor: relatedInstructor ? {
            id: relatedInstructor.id,
            fullname: relatedInstructor.fullname,
            avatar: relatedInstructor.avatar
          } : null
        };
      });

    res.json({ 
      ...course, 
      instructor, 
      reviews: reviewsWithUsers,
      related_courses: relatedCourses,
      stats: {
        total_reviews: courseReviews.length,
        average_rating: courseReviews.length > 0 
          ? courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length 
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get all instructors
app.get('/api/instructors', (req, res) => {
  try {
    const instructorsWithCourses = instructors.map(instructor => {
      const instructorCourses = courses.filter(c => c.instructor_id === instructor.id);
      const totalStudents = instructorCourses.reduce((sum, course) => sum + (course.number_of_reviews || 0), 0);
      
      return {
        ...instructor,
        course_count: instructorCourses.length,
        total_students: totalStudents,
        average_rating: instructorCourses.length > 0
          ? instructorCourses.reduce((sum, course) => sum + (course.rating || 0), 0) / instructorCourses.length
          : 0
      };
    });

    res.json(instructorsWithCourses);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get instructor by ID
app.get('/api/instructors/:id', (req, res) => {
  try {
    const instructor = instructors.find(i => i.id === req.params.id);
    if (!instructor) return res.status(404).json({ error: 'Instructor not found' });

    const instructorCourses = courses.filter(c => c.instructor_id === instructor.id);
    const allReviews = reviews.filter(r => 
      instructorCourses.some(course => course.id === r.course_id)
    );

    res.json({
      ...instructor,
      courses: instructorCourses,
      stats: {
        total_courses: instructorCourses.length,
        total_students: instructorCourses.reduce((sum, course) => sum + (course.number_of_reviews || 0), 0),
        total_reviews: allReviews.length,
        average_rating: allReviews.length > 0
          ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get all categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = [...new Set(courses.map(course => course.category).filter(Boolean))];
    const categoriesWithCount = categories.map(category => ({
      name: category,
      course_count: courses.filter(c => c.category === category).length
    }));

    res.json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get all sub-categories with course counts
app.get('/api/sub-categories', (req, res) => {
  try {
    const { category = '' } = req.query;
    
    let coursesToAnalyze = courses;
    
    // If category is specified, only get sub_categories for that category
    if (category) {
      coursesToAnalyze = courses.filter(course => 
        course.category?.toLowerCase() === category.toLowerCase() ||
        course.category?.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    const subCategories = [...new Set(coursesToAnalyze.map(course => course.sub_category).filter(Boolean))];
    const subCategoriesWithCount = subCategories.map(subCategory => ({
      name: subCategory,
      category: category || 'all',
      course_count: coursesToAnalyze.filter(c => c.sub_category === subCategory).length
    }));

    res.json(subCategoriesWithCount);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get price range statistics
app.get('/api/price-range', (req, res) => {
  try {
    const prices = courses.map(course => course.discount_price || course.price || 0).filter(price => price > 0);
    
    if (prices.length === 0) {
      return res.json({ min: 0, max: 0, average: 0 });
    }
    
    const priceStats = {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length),
      ranges: {
        free: courses.filter(c => (c.discount_price || c.price || 0) === 0).length,
        under_500k: courses.filter(c => (c.discount_price || c.price || 0) < 500000 && (c.discount_price || c.price || 0) > 0).length,
        '500k_1m': courses.filter(c => {
          const price = c.discount_price || c.price || 0;
          return price >= 500000 && price < 1000000;
        }).length,
        '1m_2m': courses.filter(c => {
          const price = c.discount_price || c.price || 0;
          return price >= 1000000 && price < 2000000;
        }).length,
        over_2m: courses.filter(c => (c.discount_price || c.price || 0) >= 2000000).length
      }
    };

    res.json(priceStats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      total_courses: courses.length,
      total_instructors: instructors.length,
      total_users: users.length,
      total_reviews: reviews.length,
      categories: [...new Set(courses.map(c => c.category).filter(Boolean))].length,
      average_rating: courses.length > 0 
        ? courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length 
        : 0,
      bestseller_count: courses.filter(c => c.is_bestseller === 1).length,
      new_courses_count: courses.filter(c => c.is_new === 1).length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    data_loaded: {
      courses: courses.length,
      instructors: instructors.length,
      reviews: reviews.length,
      users: users.length
    }
  });
});

// Mock data endpoints
app.get('/api/mock/courses', (req, res) => {
  try {
    res.json({
      courses: courses,
      total: courses.length,
      success: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/mock/instructors', (req, res) => {
  try {
    res.json({
      instructors: instructors,
      total: instructors.length,
      success: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/mock/reviews', (req, res) => {
  try {
    res.json({
      reviews: reviews,
      total: reviews.length,
      success: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/mock/users', (req, res) => {
  try {
    res.json({
      users: users,
      total: users.length,
      success: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Advanced filter endpoint with price range, name, category, and sub_category
app.get('/api/filter', (req, res) => {
  try {
    const { 
      q = '',               // Search by name/title
      category = '',        // Filter by category
      sub_category = '',    // Filter by sub_category
      min_price = 0,        // Minimum price
      max_price = 999999999,// Maximum price
      level = '',           // Filter by level
      page = 1,             // Pagination
      limit = 12,           // Items per page
      sort = 'title',       // Sort by
      instructor_id = ''    // Filter by instructor
    } = req.query;

    let filtered = courses.filter(course => {
      // Search by title, description, or any text content
      const matchSearch = !q || 
        course.title?.toLowerCase().includes(q.toLowerCase()) ||
        course.description?.toLowerCase().includes(q.toLowerCase()) ||
        course.category?.toLowerCase().includes(q.toLowerCase()) ||
        course.sub_category?.toLowerCase().includes(q.toLowerCase());
      
      // Filter by category (exact match or contains)
      const matchCategory = !category || 
        course.category?.toLowerCase() === category.toLowerCase() ||
        course.category?.toLowerCase().includes(category.toLowerCase());
      
      // Filter by sub_category (exact match or contains)
      const matchSubCategory = !sub_category || 
        course.sub_category?.toLowerCase() === sub_category.toLowerCase() ||
        course.sub_category?.toLowerCase().includes(sub_category.toLowerCase());
      
      // Filter by level
      const matchLevel = !level || course.level === level;
      
      // Filter by instructor
      const matchInstructor = !instructor_id || course.instructor_id === instructor_id;
      
      // Filter by price range (handle both original price and discount price)
      const coursePrice = course.discount_price || course.price || 0;
      const matchPrice = coursePrice >= parseInt(min_price) && coursePrice <= parseInt(max_price);
      
      return matchSearch && matchCategory && matchSubCategory && matchLevel && matchInstructor && matchPrice;
    });

    // Sort courses
    filtered.sort((a, b) => {
      switch (sort) {
        case 'price_asc':
          const priceA = a.discount_price || a.price || 0;
          const priceB = b.discount_price || b.price || 0;
          return priceA - priceB;
        case 'price_desc':
          const priceDescA = a.discount_price || a.price || 0;
          const priceDescB = b.discount_price || b.price || 0;
          return priceDescB - priceDescA;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'reviews':
          return (b.number_of_reviews || 0) - (a.number_of_reviews || 0);
        case 'newest':
          return new Date(b.last_updated || 0) - new Date(a.last_updated || 0);
        case 'duration':
          return (b.duration_hours || 0) - (a.duration_hours || 0);
        default:
          return (a.title || '').localeCompare(b.title || '');
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedCourses = filtered.slice(startIndex, endIndex);

    // Add instructor info and additional data to each course
    const coursesWithDetails = paginatedCourses.map(course => {
      const instructor = instructors.find(i => i.id === course.instructor_id);
      const courseReviewCount = reviews.filter(r => r.course_id === course.id).length;
      const actualPrice = course.discount_price || course.price || 0;
      
      return {
        ...course,
        instructor: instructor ? {
          id: instructor.id,
          fullname: instructor.fullname,
          avatar: instructor.avatar
        } : null,
        actual_review_count: courseReviewCount,
        effective_price: actualPrice,
        has_discount: course.discount_price && course.discount_price < course.price
      };
    });

    // Generate filter statistics
    const stats = {
      total_found: filtered.length,
      price_range: {
        min: Math.min(...filtered.map(c => c.discount_price || c.price || 0)),
        max: Math.max(...filtered.map(c => c.discount_price || c.price || 0))
      },
      categories: [...new Set(filtered.map(c => c.category).filter(Boolean))],
      sub_categories: [...new Set(filtered.map(c => c.sub_category).filter(Boolean))],
      levels: [...new Set(filtered.map(c => c.level).filter(Boolean))],
      instructors: [...new Set(filtered.map(c => c.instructor_id).filter(Boolean))].length
    };

    res.json({
      courses: coursesWithDetails,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(filtered.length / limit),
        total_courses: filtered.length,
        per_page: parseInt(limit),
        has_next: parseInt(page) < Math.ceil(filtered.length / limit),
        has_prev: parseInt(page) > 1
      },
      filters_applied: {
        search_query: q,
        category: category,
        sub_category: sub_category,
        price_range: {
          min: parseInt(min_price),
          max: parseInt(max_price)
        },
        level: level,
        instructor_id: instructor_id
      },
      statistics: stats
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get all courses (simplified data) - MUST BE BEFORE /:id route
app.get('/api/courses/all', (req, res) => {
  try {
    const simplifiedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      category: course.category,
      price: course.price,
      discount_price: course.discount_price,
      description: course.description,
      duration_hours: course.duration_hours,
      number_of_lectures: course.number_of_lectures,
      rating: course.rating,
      number_of_reviews: course.number_of_reviews,
      is_bestseller: course.is_bestseller,
      is_new: course.is_new
    }));

    res.json({
      total_courses: simplifiedCourses.length,
      courses: simplifiedCourses
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 Courses: http://localhost:${PORT}/api/courses`);
  console.log(`⭐ Featured: http://localhost:${PORT}/api/courses/featured`);
  console.log(`👨‍🏫 Instructors: http://localhost:${PORT}/api/instructors`);
});