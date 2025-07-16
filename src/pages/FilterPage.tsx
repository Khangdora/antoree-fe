import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import CourseCard from "../components/ui/CourseCard";
import { dataProcessor } from "../services/dataProcessor";
import { coursesService, type Course } from "../services/api";
import categoriesData from "../data/categories.json";

interface FilterSettings {
  category: string | null;
  level: string | null;
  rating: number | null;
  instructor_id: string | null;
  priceRange: [number, number];
  searchQuery: string;
  filterType: "all" | "main" | "other";
  sort: "title" | "price" | "rating" | "date" | "popularity";
  page: number;
  limit: number;
}

const FilterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy categoryId từ query params nếu có (khi click từ header)
  const queryParams = new URLSearchParams(location.search);
  const initialCategoryId = queryParams.get("category");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategoryId
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]); // 0đ - 5tr
  const sliderRef = useRef<HTMLDivElement>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    category: initialCategoryId,
    level: null,
    rating: null,
    instructor_id: null,
    priceRange: [0, 5000000],
    searchQuery: "",
    filterType: "all",
    sort: "title",
    page: 1,
    limit: 12,
  });

  // Get unique categories from courses data with count
  const getCategories = () => {
    // Use dataProcessor to get categories with course counts
    const stats = dataProcessor.getStats();
    const categoryNames = dataProcessor.getCategories();

    return categoryNames.map((name) => ({
      name,
      count: Math.floor(stats.total_courses / categoryNames.length), // Distribute evenly for demo
    }));
  };

  // Get category data with course count
  const getAllCategoriesWithData = () => {
    const courseCounts = getCategories();

    return categoriesData.allCategories.map((cat) => {
      const courseCount =
        courseCounts.find((c) => c.name === cat.name)?.count || 0;
      const mainCategory = categoriesData.mainCategories.find(
        (main) => main.id === cat.id
      );
      return {
        ...cat,
        courseCount,
        subcategories: mainCategory?.subcategories || [],
        minPrice: Math.floor(Math.random() * 500000),
        maxPrice: Math.floor(Math.random() * 4500000) + 500000,
      };
    });
  };

  const allCategories = getAllCategoriesWithData();
  const mainCategories = allCategories.filter((cat) =>
    categoriesData.mainCategories.some((main) => main.id === cat.id)
  );
  const otherCategories = allCategories.filter(
    (cat) => !categoriesData.mainCategories.some((main) => main.id === cat.id)
  );

  const buildCategoryHierarchy = () => {
    const hierarchy = [];

    // Thêm các danh mục chính từ mainCategories
    for (const mainCat of categoriesData.mainCategories) {
      const subcategories =
        mainCat.subcategories?.map((subCat) => ({
          id: `${mainCat.id}-${subCat.toLowerCase().replace(/\s+/g, "-")}`,
          name: subCat,
          parentId: mainCat.id,
          count: Math.floor(Math.random() * 30) + 5,
        })) || [];

      hierarchy.push({
        id: mainCat.id,
        name: mainCat.name,
        icon: mainCat.icon,
        children: subcategories,
      });
    }

    // Thêm các danh mục khác không thuộc mainCategories
    const otherCatsGroup = {
      id: "other-categories",
      name: "Danh mục khác",
      icon: "📚",
      children: otherCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        count: cat.courseCount || Math.floor(Math.random() * 20) + 5, // Random count for demo
        parentId: "other-categories",
      })),
    };

    if (otherCatsGroup.children.length > 0) {
      hierarchy.push(otherCatsGroup);
    }

    return hierarchy;
  };

  const categoryHierarchy = buildCategoryHierarchy();

  // Tìm categoryId trong hierarchy (có thể là subcategory)
  const findCategoryInHierarchy = (id: string) => {
    for (const mainCat of categoryHierarchy) {
      if (mainCat.id === id) return { mainCat, subCat: null };

      const subCat = mainCat.children.find((sub) => sub.id === id);
      if (subCat) return { mainCat, subCat };
    }
    return null;
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (filterSettings.category)
      params.set("category", filterSettings.category);
    if (filterSettings.searchQuery) params.set("q", filterSettings.searchQuery);
    if (filterSettings.priceRange[0] > 0)
      params.set("min_price", filterSettings.priceRange[0].toString());
    if (filterSettings.priceRange[1] < 5000000)
      params.set("max_price", filterSettings.priceRange[1].toString());
    if (filterSettings.level) params.set("level", filterSettings.level);
    if (filterSettings.rating)
      params.set("rating", filterSettings.rating.toString());
    if (filterSettings.sort !== "title")
      params.set("sort", filterSettings.sort);
    if (filterSettings.page > 1)
      params.set("page", filterSettings.page.toString());

    navigate(
      {
        pathname: "/filter",
        search: params.toString(),
      },
      { replace: true }
    );

    fetchFilteredCourses();
  };

  useEffect(() => {
    const handleHeaderSearch = (e: CustomEvent) => {
      setFilterSettings(prev => ({
        ...prev,
        searchQuery: e.detail.query,
        category: null // Reset category when searching
      }));
      fetchFilteredCourses();
    };

    window.addEventListener('header-search-updated', handleHeaderSearch as EventListener);
    return () => {
      window.removeEventListener('header-search-updated', handleHeaderSearch as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleHeaderCategorySelect = (e: CustomEvent) => {
      setFilterSettings(prev => ({
        ...prev,
        category: e.detail.categoryId,
        searchQuery: '' // Reset search when selecting category
      }));
      setSelectedCategory(e.detail.categoryId);
      fetchFilteredCourses();
    };

    window.addEventListener('header-category-updated', handleHeaderCategorySelect as EventListener);
    return () => {
      window.removeEventListener('header-category-updated', handleHeaderCategorySelect as EventListener);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlCategory = params.get("category");
    const urlQuery = params.get("q");
    const urlMinPrice = params.get("min_price");
    const urlMaxPrice = params.get("max_price");
    const urlLevel = params.get("level");
    const urlRating = params.get("rating");
    const urlSort = params.get("sort");
    const urlPage = params.get("page");

    setFilterSettings((prev) => ({
      ...prev,
      category: urlCategory || null,
      searchQuery: urlQuery || "",
      priceRange: [
        urlMinPrice ? parseInt(urlMinPrice) : 0,
        urlMaxPrice ? parseInt(urlMaxPrice) : 5000000,
      ],
      level: urlLevel || null,
      rating: urlRating ? parseInt(urlRating) : null,
      sort: (urlSort as FilterSettings["sort"]) || "title",
      page: urlPage ? parseInt(urlPage) : 1,
    }));

    if (
      urlCategory ||
      urlQuery ||
      urlMinPrice ||
      urlMaxPrice ||
      urlLevel ||
      urlRating ||
      urlSort ||
      urlPage
    ) {
      applyFilters();
    }
  }, [location.search]);

  // Initial load of courses when component mounts
  useEffect(() => {
    fetchFilteredCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khi component mount, nếu có categoryId từ query param, mở rộng danh mục cha của nó
  useEffect(() => {
    if (initialCategoryId) {
      const foundCategory = findCategoryInHierarchy(initialCategoryId);

      if (foundCategory) {
        const { mainCat, subCat } = foundCategory;

        // Nếu là subcategory, chọn subcategory đó
        if (subCat) {
          setSelectedCategory(subCat.id);
        }
        // Nếu là mainCategory, chọn mainCategory đó
        else {
          setSelectedCategory(mainCat.id);
        }
      }
    }
  }, [initialCategoryId]);

  // Format số tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Function to fetch courses based on current filters
  const fetchFilteredCourses = async () => {
    setIsLoading(true);
    try {
      let categoryName;
      if (filterSettings.category) {
        const found = findCategoryInHierarchy(filterSettings.category);
        if (found) {
          const categoryInfo = categoriesData.mainCategories.find(
            (cat) => cat.id === found.mainCat.id
          );
          categoryName = categoryInfo?.name;
        }
      }

      const response = await coursesService.filterCourses({
        category: categoryName,
        level: filterSettings.level ?? undefined,
        rating: filterSettings.rating ?? undefined,
        instructor_id: filterSettings.instructor_id ?? undefined,
        min_price: filterSettings.priceRange[0],
        max_price: filterSettings.priceRange[1],
        q: filterSettings.searchQuery.trim(),
        sort: filterSettings.sort,
        page: filterSettings.page,
        limit: filterSettings.limit,
      });

      setCourses(response.courses);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMinPriceChange = (
    event: React.MouseEvent | React.TouchEvent<HTMLDivElement>,
    moveEvent: MouseEvent | TouchEvent
  ) => {
    if (!sliderRef.current) return;
    event.preventDefault();

    const rect = sliderRef.current.getBoundingClientRect();
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX =
        e instanceof TouchEvent ? e.touches[0].clientX : e.clientX;
      const position = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = position / rect.width;
      const newValue = Math.round((percentage * 5000000) / 50000) * 50000;

      if (newValue < filterSettings.priceRange[1]) {
        setFilterSettings((prev) => ({
          ...prev,
          priceRange: [newValue, prev.priceRange[1]],
        }));
      }
    };

    const handleEnd = () => {
      document.removeEventListener("mousemove", handleMove as any);
      document.removeEventListener("touchmove", handleMove as any);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
    };

    document.addEventListener("mousemove", handleMove as any);
    document.addEventListener("touchmove", handleMove as any);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchend", handleEnd);

    handleMove(moveEvent);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleMaxPriceChange = (
    moveEvent: MouseEvent
  ) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const position = moveEvent.clientX - rect.left;
      const percentage = Math.max(0, Math.min(position / rect.width, 1));
      const newValue = Math.round((percentage * 5000000) / 50000) * 50000; // Step of 50,000
      if (newValue > filterSettings.priceRange[0]) {
        setFilterSettings((prev) => ({
          ...prev,
          priceRange: [prev.priceRange[0], newValue],
        }));
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    handleMouseMove(moveEvent);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Main Content with Sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Main content area */}
            <div className="w-full">
              {/* Search Input with Filters */}
              <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                <form onSubmit={handleSearchSubmit} className="space-y-4">
                  {/* Search and Category Row */}
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-grow relative">
                      <input
                        type="text"
                        placeholder="Tìm kiếm theo tên khóa học..."
                        value={filterSettings.searchQuery}
                        onChange={(e) =>
                          setFilterSettings((prev) => ({
                            ...prev,
                            searchQuery: e.target.value,
                          }))
                        }
                        className="w-full px-5 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 
            dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
            focus:border-transparent dark:text-white"
                      />
                      <div className="absolute right-4 top-3 text-gray-400">
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
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Category Select */}
                    <select
                      value={filterSettings.category || ""}
                      onChange={(e) =>
                        setFilterSettings((prev) => ({
                          ...prev,
                          category: e.target.value || null,
                        }))
                      }
                      className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 
                      bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white min-w-[200px]
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Tất cả danh mục</option>
                      {mainCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category.courseCount})
                        </option>
                      ))}
                    </select>

                    {/* Level Select */}
                    <select
                      value={filterSettings.level || ""}
                      onChange={(e) =>
                        setFilterSettings((prev) => ({
                          ...prev,
                          level: e.target.value || null,
                        }))
                      }
                      className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 
          bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white min-w-[150px]
          focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Mọi trình độ</option>
                      {dataProcessor.getLevels().map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Additional Filters Row */}
                  <div className="flex flex-col md:flex-wrap md:flex-row items-center gap-4">
                    {/* Price Range Slider */}
                    <div className="flex-1 space-y-2 w-full md:w-auto">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Khoảng giá
                        </label>
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          {formatPrice(filterSettings.priceRange[0])} -{" "}
                          {formatPrice(filterSettings.priceRange[1])}
                        </span>
                      </div>
                      <div
                        ref={sliderRef}
                        className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full"
                      >
                        <div
                          className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{
                            left: `${
                              (filterSettings.priceRange[0] / 5000000) * 100
                            }%`,
                            width: `${
                              ((filterSettings.priceRange[1] -
                                filterSettings.priceRange[0]) /
                                5000000) *
                              100
                            }%`,
                          }}
                        />
                        {/* Handles */}
                        <div
                          className="absolute w-4 h-4 bg-white dark:bg-gray-200 rounded-full shadow-lg -mt-1.5 border-2 border-blue-500 cursor-pointer hover:scale-110 transition-transform"
                          style={{
                            left: `calc(${
                              (filterSettings.priceRange[0] / 5000000) * 100
                            }% - 8px)`,
                          }}
                          onMouseDown={(e) =>
                            handleMinPriceChange(e, e.nativeEvent)
                          }
                          onTouchStart={(e) =>
                            handleMinPriceChange(
                              e,
                              e.nativeEvent as unknown as MouseEvent
                            )
                          }
                        />
                        <div
                          className="absolute w-4 h-4 bg-white dark:bg-gray-200 rounded-full shadow-lg -mt-1.5 border-2 border-purple-500 cursor-pointer hover:scale-110 transition-transform"
                          style={{
                            left: `calc(${
                              (filterSettings.priceRange[1] / 5000000) * 100
                            }% - 8px)`,
                          }}
                          onMouseDown={(e) =>
                            handleMaxPriceChange(e.nativeEvent)
                          }
                          onTouchStart={(e) =>
                            handleMaxPriceChange(
                              e.nativeEvent as unknown as MouseEvent
                            )
                          }
                        />
                      </div>
                      {/* Quick price buttons */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[
                          { label: "< 500K", range: [0, 500000] },
                          { label: "500K-1M", range: [500000, 1000000] },
                          { label: "1M-2M", range: [1000000, 2000000] },
                          { label: "Tất cả", range: [0, 5000000] },
                        ].map(({ label, range }) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() =>
                              setFilterSettings((prev) => ({
                                ...prev,
                                priceRange: range as [number, number],
                              }))
                            }
                            className={`px-2 py-1 text-xs rounded-lg transition-all ${
                              filterSettings.priceRange[0] === range[0] &&
                              filterSettings.priceRange[1] === range[1]
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rating Filter as Dropdown */}
                    <div className="relative w-full md:w-auto">
                      <select
                        value={filterSettings.rating ?? ""}
                        onChange={(e) =>
                          setFilterSettings((prev) => ({
                            ...prev,
                            rating: e.target.value
                              ? Number(e.target.value)
                              : null,
                          }))
                        }
                        className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 
      bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white w-full md:w-[200px]
      focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="">Tất cả đánh giá</option>
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <option key={rating} value={rating}>
                            {Array(rating).fill("⭐").join("")} ({rating}.0 trở
                            lên)
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Sort Options */}
                    <select
                      value={filterSettings.sort}
                      onChange={(e) =>
                        setFilterSettings((prev) => ({
                          ...prev,
                          sort: e.target.value as FilterSettings["sort"],
                        }))
                      }
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 
    bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm
    focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="title">Tên A-Z</option>
                      <option value="price">Giá thấp nhất</option>
                      <option value="price_desc">Giá cao nhất</option>
                      <option value="rating">Đánh giá cao nhất</option>
                      <option value="popularity">Phổ biến nhất</option>
                      <option value="date">Mới nhất</option>
                    </select>
                  </div>

                  {/* Active Filters */}
                  {(filterSettings.category ||
                    filterSettings.level ||
                    filterSettings.rating ||
                    filterSettings.priceRange[0] > 0 ||
                    filterSettings.priceRange[1] < 5000000) && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-500">
                        Bộ lọc đang áp dụng:
                      </span>
                      {filterSettings.category && (
                        <span className="px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center gap-1">
                          {
                            mainCategories.find(
                              (c) => c.id === filterSettings.category
                            )?.name
                          }
                          <button
                            onClick={() =>
                              setFilterSettings((prev) => ({
                                ...prev,
                                category: null,
                              }))
                            }
                            className="ml-1 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 
          hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg 
          transition-all transform hover:scale-[1.02]
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Áp dụng bộ lọc
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFilterSettings({
                          category: null,
                          level: null,
                          rating: null,
                          instructor_id: null,
                          priceRange: [0, 5000000],
                          searchQuery: "",
                          filterType: "all",
                          sort: "title",
                          page: 1,
                          limit: 12,
                        });
                        setSelectedCategory(null);
                        setPriceRange([0, 5000000]);
                        navigate("/filter", { replace: true });
                        fetchFilteredCourses();
                      }}
                      className="px-6 py-2 bg-gray-100 dark:bg-gray-700 
          hover:bg-gray-200 dark:hover:bg-gray-600 
          text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                </form>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-4 mb-8">
                Danh sách sản phẩm:
              </div>

              {/* Courses Grid with animations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading
                  ? // Loading state
                    Array(6)
                      .fill(0)
                      .map((_, index) => (
                        <div
                          key={index}
                          className="bg-white dark:bg-gray-800 rounded-xl p-4 h-72 animate-pulse shadow-md"
                        >
                          <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      ))
                  : courses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.5 }}
                      >
                        <CourseCard course={course} />
                      </motion.div>
                    ))}
              </div>

              {/* Empty State - update for courses */}
              {!isLoading && courses.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Không tìm thấy khóa học nào
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setPriceRange([0, 5000000]);
                      navigate("/filter", { replace: true });
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Xem tất cả khóa học
                  </button>
                </motion.div>
              )}

              {/* Stats Section */}
              <motion.div
                className="mt-16 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  Thống kê khóa học
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {courses.length}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Số khóa học hiển thị
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {selectedCategory
                        ? findCategoryInHierarchy(selectedCategory)?.mainCat
                            .name
                        : "Tất cả"}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Danh mục đang xem
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                      {formatPrice(priceRange[0])} -{" "}
                      {formatPrice(priceRange[1])}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Khoảng giá
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterPage;