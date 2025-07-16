import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { coursesService } from "../../services/api";
import { dataProcessor } from "../../services/dataProcessor";
import categoriesData from "../../data/categories.json";
import CategoryCard from "../ui/CategoryCard";
import type { CourseWithInstructor as Course } from "../../services/dataProcessor";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [categoriesDropdownPosition, setCategoriesDropdownPosition] = useState<{
    isUpward: boolean;
    maxHeight: number;
  }>({ isUpward: false, maxHeight: 400 });

  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const searchRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const cartRef = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const categoriesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accountTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [accountDropdownPosition, setAccountDropdownPosition] = useState<{
    right?: number;
    left?: number;
    width?: string;
  }>({ right: 0 });
  const [cartDropdownPosition, setCartDropdownPosition] = useState<{
    right?: number;
    left?: number;
    width?: string;
  }>({ right: 0 });

  const navigation = [
    { name: "Khuyến mãi", href: "/promotions" },
    { name: "Liên hệ", href: "/contact" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  //Header animation
  useEffect(() => {
    const updateScrolled = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", updateScrolled);
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  // Check banner visibility from localStorage
  useEffect(() => {
    const bannerHidden =
      localStorage.getItem("antoree-show-banner") === "false";
    setShowBanner(!bannerHidden);
  }, []);

  // Format price function from dataProcessor
  const formatPrice = (price: number) => {
    return dataProcessor.formatPrice(price);
  };

  // Get category icon from dataProcessor
  const getCategoryIcon = (categoryName: string) => {
    return dataProcessor.getCategoryIcon(categoryName);
  };

  // Get unique categories from dataProcessor
  const getCategories = () => {
    const categoryNames = dataProcessor.getCategories();
    const stats = dataProcessor.getStats();

    return categoryNames.map((name) => ({
      name,
      count: Math.floor(stats.total_courses / categoryNames.length),
    }));
  };

  // Get main categories for mega menu (first 8 featured categories)
  const getMainCategories = () => {
    const mainCats = categoriesData.mainCategories.slice(0, 8);
    const courseCounts = getCategories();

    return mainCats.map((cat) => {
      const courseCount =
        courseCounts.find((c) => c.name === cat.name)?.count || 0;
      return {
        ...cat,
        courseCount,
      };
    });
  };

  const categories = getCategories();
  const mainCategories = getMainCategories();

  // Mock cart items
  const cartItems = [
    {
      id: 1,
      name: "Khóa học React từ cơ bản đến nâng cao",
      price: 599000,
      quantity: 1,
      image: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      id: 2,
      name: "Thiết kế UI/UX với Figma",
      price: 499000,
      quantity: 1,
      image: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Search functionality with API and debounce
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearchLoading(true);
        setShowSearchResults(true);

        try {
          // Use API to search courses
          const results = await coursesService.searchCourses(searchQuery);
          setSearchResults(results.slice(0, 5) as Course[]); // Limit to 5 results for dropdown
        } catch (error) {
          console.error("Search error:", error);
          // Fallback to dataProcessor as last resort
          const localResults = dataProcessor
            .searchCourses(searchQuery)
            .slice(0, 5);
          setSearchResults(localResults);
        } finally {
          setIsSearchLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
        setIsSearchLoading(false);
      }
    }, 500); // Reduced debounce time for better UX with mock data

    // Show loading immediately when user starts typing
    if (searchQuery.trim() && !isSearchLoading) {
      setIsSearchLoading(true);
      setShowSearchResults(true);
    }

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchPath = `/filter?q=${encodeURIComponent(searchQuery)}`;
      
      // If already on filter page, use navigate with replace and trigger reload
      if (location.pathname === '/filter') {
        navigate(searchPath, { replace: true });
        // Dispatch an event that FilterPage can listen for
        window.dispatchEvent(new CustomEvent('header-search-updated', { 
          detail: { query: searchQuery } 
        }));
      } else {
        navigate(searchPath);
      }
      
      setShowSearchResults(false);
      setSearchQuery("");
      setIsSearchFocused(false);
    }
  };

  // Handle banner close
  const handleCloseBanner = () => {
    setShowBanner(false);
    localStorage.setItem("antoree-show-banner", "false");
  };

  const calculateDropdownPositionRightSide = (
    ref: React.RefObject<HTMLDivElement>,
    setPosition: React.Dispatch<
      React.SetStateAction<{ right?: number; left?: number; width?: string }>
    >
  ) => {
    if (!ref.current) return;

    const windowWidth = window.innerWidth;
    const isMobile = windowWidth < 640; // sm breakpoint là 640px
    const dropdownWidth = 320;
  
    if (!isMobile) {
      setPosition({ right: 0 });
    } else {
      // Giao diện < sm
      if (windowWidth < dropdownWidth) {
        // Nếu màn hình nhỏ hơn dropdown: Chiếm toàn màn hình, căn trái
        setPosition({ left: 0, right: 0, width: "100%" });
      } else {
        setPosition({ left: 0, right: undefined });
      }
    }
  };

  // Calculate dropdown position based on available space
  const calculateDropdownPosition = () => {
    if (!categoriesRef.current) return;

    const element = categoriesRef.current;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const defaultDropdownHeight = 400;
    const buffer = 20; // Buffer from screen edges

    // Calculate space below and above the element
    const spaceBelow = windowHeight - rect.bottom - buffer;
    const spaceAbove = rect.top - buffer;

    let isUpward = false;
    let maxHeight = defaultDropdownHeight;

    // If not enough space below but more space above, show upward
    if (spaceBelow < defaultDropdownHeight && spaceAbove > spaceBelow) {
      isUpward = true;
      maxHeight = Math.min(spaceAbove, defaultDropdownHeight);
    } else {
      // Show downward
      isUpward = false;
      maxHeight = Math.min(spaceBelow, defaultDropdownHeight);
    }

    // Ensure minimum height
    maxHeight = Math.max(maxHeight, 200);

    setCategoriesDropdownPosition({ isUpward, maxHeight });
  };

  // Update position when dropdown is shown
  useEffect(() => {
    if (showCategoriesDropdown) {
      calculateDropdownPosition();
    }
  }, [showCategoriesDropdown]);

  // Recalculate position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (showCategoriesDropdown) {
        calculateDropdownPosition();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showCategoriesDropdown]);

  // Hover handlers for categories dropdown
  const handleCategoriesMouseEnter = () => {
    if (categoriesTimeoutRef.current) {
      clearTimeout(categoriesTimeoutRef.current);
    }
    setShowCategoriesDropdown(true);
  };

  const handleCategoriesMouseLeave = () => {
    categoriesTimeoutRef.current = setTimeout(() => {
      setShowCategoriesDropdown(false);
    }, 200);
  };

  // Hover handlers for account dropdown
  const handleAccountMouseEnter = () => {
    if (accountTimeoutRef.current) {
      clearTimeout(accountTimeoutRef.current);
    }
    calculateDropdownPositionRightSide(accountRef, setAccountDropdownPosition);
    setShowAccountDropdown(true);
  };

  const handleAccountMouseLeave = () => {
    accountTimeoutRef.current = setTimeout(() => {
      setShowAccountDropdown(false);
    }, 200);
  };

  // Hover handlers for cart dropdown
  const handleCartMouseEnter = () => {

    if(window.innerWidth < 500) return;

    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current);
    }
    calculateDropdownPositionRightSide(cartRef, setCartDropdownPosition);
    setShowCartDropdown(true);
  };

  const handleCartClick = () => {
    if (window.innerWidth < 500) {
      navigate('/cart');
      return;
    }

    setShowCartDropdown(!showCartDropdown);
  }

  const handleCartMouseLeave = () => {
    cartTimeoutRef.current = setTimeout(() => {
      setShowCartDropdown(false);
    }, 200);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
          : "bg-white dark:bg-gray-900"
      }`}
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Top banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-center py-2 text-sm relative overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            <p className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                  clipRule="evenodd"
                />
              </svg>
              Học online miễn phí 7 ngày đầu - Hotline: 1900 1234
            </p>
            <motion.button
              onClick={handleCloseBanner}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200 transition-all duration-200 cursor-pointer z-100"
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Đóng banner"
            >
              <svg
                className="w-4 h-4"
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
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:hidden flex items-center justify-between py-3">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <motion.div
                className="h-10 w-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{
                  scale: 1.1,
                  rotate: 6,
                  boxShadow:
                    "0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(147, 51, 234, 0.5)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 10,
                }}
              >
                <motion.span
                  className="text-white font-bold text-xl"
                  whileHover={{ scale: 1.2 }}
                >
                  A
                </motion.span>
              </motion.div>
              <motion.span
                className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                style={
                  theme === "dark"
                    ? {
                        backgroundImage:
                          "linear-gradient(to left, #3b82f6, #8b5cf6, #d946ef)",
                      }
                    : {}
                }
                initial={false}
                animate={{ opacity: 1 }}
                whileHover={{
                  backgroundImage:
                    "linear-gradient(to right, #3b82f6, #8b5cf6, #d946ef)",
                  transition: { duration: 0.3 },
                }}
              >
                Antoree
              </motion.span>
            </Link>
          </div>

          {/* Theme toggle */}
          <div className="flex items-center">
            <motion.button
              onClick={toggleTheme}
              className={`relative inline-flex h-8 w-14 items-center rounded-full cursor-pointer ${
                theme === "dark"
                  ? "bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-800 shadow-lg shadow-blue-500/25"
                  : "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 shadow-lg shadow-amber-500/25"
              } focus:outline-none`}
              aria-label="Toggle theme"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={false}
            >
              {/* Existing theme toggle content */}
              <motion.div
                className="absolute w-6 h-6 rounded-full flex items-center justify-center"
                initial={false}
                animate={{
                  x: theme === "dark" ? 6 : 24,
                  rotate: theme === "dark" ? -30 : 0,
                  backgroundColor: theme === "dark" ? "#1e3a8a" : "#fcd34d",
                  boxShadow:
                    theme === "dark"
                      ? "0 0 8px 1px rgba(59, 130, 246, 0.6), inset 0 0 4px rgba(30, 64, 175, 0.8)"
                      : "0 0 8px 1px rgba(251, 191, 36, 0.6), inset 0 0 4px rgba(217, 119, 6, 0.8)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 700,
                  damping: 30,
                }}
              >
                {/* Existing icon content */}
                <motion.div
                  initial={false}
                  animate={{
                    rotate: theme === "dark" ? 0 : 180,
                    scale: theme === "dark" ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {theme === "dark" ? (
                    <svg
                      className="w-4 h-4 text-blue-100"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-amber-700"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </motion.div>
              </motion.div>

              <motion.div
                className="absolute inset-0 rounded-full"
                initial={false}
                animate={{
                  opacity: [0.5, 0.7, 0.5],
                  scale: [1, 1.02, 1],
                  background:
                    theme === "dark"
                      ? "linear-gradient(90deg, rgba(30,58,138,0.3), rgba(79,70,229,0.2), rgba(124,58,237,0.3))"
                      : "linear-gradient(90deg, rgba(251,191,36,0.3), rgba(249,115,22,0.2), rgba(234,179,8,0.3))",
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                }}
              />
            </motion.button>
          </div>
        </div>

        {/* Second row for small devices / Main row for desktop */}
        <div className="flow sm:flex items-center sm:justify-between h-16">
          {/* Logo for medium+ devices */}
          <div className="hidden sm:block flex-shrink-0 mr-4">
            <Link to="/" className="flex items-center group">
              <motion.div
                className="h-10 w-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{
                  scale: 1.1,
                  rotate: 6,
                  boxShadow:
                    "0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(147, 51, 234, 0.5)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 10,
                }}
              >
                <motion.span
                  className="text-white font-bold text-xl"
                  whileHover={{ scale: 1.2 }}
                >
                  A
                </motion.span>
              </motion.div>
              <motion.span
                className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                style={
                  theme === "dark"
                    ? {
                        backgroundImage:
                          "linear-gradient(to left, #3b82f6, #8b5cf6, #d946ef)",
                      }
                    : {}
                }
                initial={false}
                animate={{ opacity: 1 }}
                whileHover={{
                  backgroundImage:
                    "linear-gradient(to right, #3b82f6, #8b5cf6, #d946ef)",
                  transition: { duration: 0.3 },
                }}
              >
                Antoree
              </motion.span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-xl group ${
                  isActive(item.href)
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <motion.div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></motion.div>
                )}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
              </Link>
            ))}

            {/* Categories Dropdown - Mega Menu Style */}
            <motion.div
              className="relative"
              ref={categoriesRef}
              onMouseEnter={handleCategoriesMouseEnter}
              onMouseLeave={handleCategoriesMouseLeave}
            >
              <motion.button
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 group overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 rounded-xl"
                  initial={false}
                  whileHover={{ opacity: 1 }}
                />
                <motion.div className="relative z-10 flex items-center gap-2">
                  <motion.svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </motion.svg>
                  <span>Khóa học</span>
                  <motion.svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: showCategoriesDropdown ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </motion.svg>
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {showCategoriesDropdown && (
                  <motion.div
                    ref={categoriesDropdownRef}
                    className={`absolute left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-screen max-w-4xl z-50 overflow-hidden`}
                    style={{
                      maxHeight: `${categoriesDropdownPosition.maxHeight}px`,
                      top: categoriesDropdownPosition.isUpward
                        ? "auto"
                        : "100%",
                      bottom: categoriesDropdownPosition.isUpward
                        ? "100%"
                        : "auto",
                      marginTop: categoriesDropdownPosition.isUpward
                        ? 0
                        : "0.5rem",
                      marginBottom: categoriesDropdownPosition.isUpward
                        ? "0.5rem"
                        : 0,
                    }}
                    initial={{
                      opacity: 0,
                      y: categoriesDropdownPosition.isUpward ? 10 : -10,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: categoriesDropdownPosition.isUpward ? 10 : -10,
                      scale: 0.95,
                      transition: { duration: 0.2 },
                    }}
                    transition={{
                      type: "spring",
                      damping: 20,
                      stiffness: 300,
                    }}
                  >
                    {/* Decorative gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10"></div>

                    {/* Animated particles for decoration */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                          style={{
                            width: Math.random() * 60 + 20,
                            height: Math.random() * 60 + 20,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                          }}
                          animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.4, 0.2],
                          }}
                          transition={{
                            duration: Math.random() * 3 + 3,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                          }}
                        />
                      ))}
                    </div>

                    {/* Header */}
                    <motion.div
                      className="relative px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex-shrink-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <motion.h3
                        className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          delay: 0.2,
                        }}
                      >
                        <motion.svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          animate={{
                            rotate: [0, 10, 0, -10, 0],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                          }}
                        >
                          <path
                            fillRule="evenodd"
                            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                            clipRule="evenodd"
                          />
                        </motion.svg>
                        Danh mục khóa học
                        <motion.span
                          className="ml-2 text-sm text-gray-500 dark:text-gray-400"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          ({mainCategories.length} danh mục chính)
                        </motion.span>
                      </motion.h3>
                    </motion.div>

                    {/* Categories Grid - Scrollable - Staggered animation */}
                    <div
                      className="relative overflow-y-auto mega-menu-scroll"
                      style={{
                        maxHeight: `${
                          categoriesDropdownPosition.maxHeight - 140
                        }px`,
                      }}
                    >
                      <motion.div
                        className="p-6"
                        variants={{
                          hidden: { opacity: 0 },
                          show: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.05,
                            },
                          },
                        }}
                        initial="hidden"
                        animate="show"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {mainCategories.map((category) => (
                            <motion.div
                              key={category.id}
                              variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 },
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                              }}
                            >
                              <CategoryCard
                                category={category}
                                onCategoryClick={() => {
                                  setShowCategoriesDropdown(false);
                                  
                                  // Special handling when on filter page
                                  if (location.pathname === '/filter') {
                                    const categoryPath = `/filter?category=${category.id}`;
                                    navigate(categoryPath, { replace: true });
                                    window.dispatchEvent(new CustomEvent('header-category-updated', { 
                                      detail: { categoryId: category.id } 
                                    }));
                                    return;
                                  }
                                }}
                                variant="main"
                              />
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>

                    {/* Footer with button animation */}
                    <motion.div
                      className="relative px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-800/50 flex-shrink-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 17,
                          }}
                        >
                          <Link
                            to="/categories"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-lg relative overflow-hidden group"
                            onClick={() => setShowCategoriesDropdown(false)}
                          >
                            {/* Shimmer effect */}
                            <motion.div
                              className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                              style={{ x: "-100%" }}
                              animate={{ x: "100%" }}
                              transition={{
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 2,
                                repeatDelay: 1,
                              }}
                            />
                            <span className="relative z-10">
                              Xem tất cả danh mục
                            </span>
                            <motion.svg
                              className="ml-2 w-4 h-4 relative z-10"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              animate={{ x: [0, 5, 0] }}
                              transition={{
                                repeat: Infinity,
                                repeatType: "reverse",
                                duration: 1,
                                repeatDelay: 1,
                              }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </motion.svg>
                          </Link>
                        </motion.div>
                        <motion.div
                          className="text-sm text-gray-500 dark:text-gray-400"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <span className="font-medium">
                            {categories.length - mainCategories.length}
                          </span>{" "}
                          danh mục khác có sẵn
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </nav>

          {/* Desktop Search bar */}
          <div
            className="hidden md:flex flex-1 max-w-xl mx-6 relative"
            ref={searchRef}
          >
            <motion.form
              onSubmit={handleSearchSubmit}
              initial={{ opacity: 0.9 }}
              whileHover={{ scale: 1.01 }}
              animate={{ opacity: 1 }}
            >
              <motion.div className="relative group" whileTap={{ scale: 0.99 }}>
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() =>
                    setTimeout(() => setIsSearchFocused(false), 200)
                  }
                  className={`w-full px-4 py-3 pl-12 pr-20 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-300 ${
                    isSearchFocused
                      ? "shadow-xl scale-105 bg-white dark:bg-gray-800"
                      : "shadow-md hover:shadow-lg bg-gray-50 dark:bg-gray-800 hover:bg-white"
                  }`}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className={`h-5 w-5 transition-colors duration-300 ${
                      isSearchFocused ? "text-blue-500" : "text-gray-400"
                    }`}
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
                <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
                  {isSearchLoading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                  )}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setShowSearchResults(false);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110"
                    >
                      <svg
                        className="h-4 w-4"
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
                  )}
                  <button
                    type="submit"
                    className="p-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-110 shadow-md"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5-5 5"
                      />
                    </svg>
                  </button>
                </div>
              </motion.div>
            </motion.form>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl mt-2 max-h-96 overflow-hidden z-50 animate-fadeIn">
                <div className="py-2 overflow-y-auto max-h-96">
                  {isSearchLoading ? (
                    // Loading state
                    <div className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="relative">
                          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-purple-600 rounded-full animate-ping"></div>
                        </div>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Đang tìm kiếm khóa học...
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Vui lòng đợi trong giây lát
                      </p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((course, index) => (
                        <Link
                          key={course.id}
                          to={`/course/${course.id}`}
                          className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group"
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery("");
                          }}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center text-2xl mr-3 group-hover:scale-110 transition-transform duration-200">
                            {getCategoryIcon(course.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">
                              {course.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {course.category} • {course.instructor.fullname}
                            </p>
                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {formatPrice(course.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                        <button
                          onClick={() => {
                            navigate(
                              `/filter?q=${encodeURIComponent(searchQuery)}`
                            );
                            setShowSearchResults(false);
                            setSearchQuery("");
                          }}
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                          Xem tất cả kết quả cho "{searchQuery}" →
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <svg
                          className="w-10 h-10 text-gray-400 animate-bounce"
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
                      <p className="text-gray-500 dark:text-gray-400">
                        Không tìm thấy khóa học nào
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Thử từ khóa khác hoặc xem tất cả khóa học
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right section - Desktop */}
          <div className="flex items-center space-x-2 justify-between">
            {/* Theme toggle - Enhanced */}
            <div className="hidden sm:flex items-center">
              <motion.button
                onClick={toggleTheme}
                className={`relative inline-flex h-8 w-14 items-center rounded-full cursor-pointer ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-800 shadow-lg shadow-blue-500/25"
                    : "bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 shadow-lg shadow-amber-500/25"
                } focus:outline-none`}
                aria-label="Toggle theme"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={false}
              >
                <motion.div
                  className="absolute w-6 h-6 rounded-full flex items-center justify-center"
                  initial={false}
                  animate={{
                    x: theme === "dark" ? 6 : 24,
                    rotate: theme === "dark" ? -30 : 0,
                    backgroundColor: theme === "dark" ? "#1e3a8a" : "#fcd34d",
                    boxShadow:
                      theme === "dark"
                        ? "0 0 8px 1px rgba(59, 130, 246, 0.6), inset 0 0 4px rgba(30, 64, 175, 0.8)"
                        : "0 0 8px 1px rgba(251, 191, 36, 0.6), inset 0 0 4px rgba(217, 119, 6, 0.8)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 700,
                    damping: 30,
                  }}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      rotate: theme === "dark" ? 0 : 180,
                      scale: theme === "dark" ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    {theme === "dark" ? (
                      <svg
                        className="w-4 h-4 text-blue-100"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-amber-700"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </motion.div>
                </motion.div>

                <motion.div
                  className="absolute inset-0 rounded-full"
                  initial={false}
                  animate={{
                    opacity: [0.5, 0.7, 0.5],
                    scale: [1, 1.02, 1],
                    background:
                      theme === "dark"
                        ? "linear-gradient(90deg, rgba(30,58,138,0.3), rgba(79,70,229,0.2), rgba(124,58,237,0.3))"
                        : "linear-gradient(90deg, rgba(251,191,36,0.3), rgba(249,115,22,0.2), rgba(234,179,8,0.3))",
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                />
              </motion.button>
            </div>

            {/* Account Dropdown - Compact */}
            <div
              className="relative"
              ref={accountRef}
              onMouseEnter={handleAccountMouseEnter}
              onMouseLeave={handleAccountMouseLeave}
            >
              <button className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl hover:scale-110 cursor-pointer">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>

              {showAccountDropdown && (
                <motion.div
                  className="absolute top-full right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl mt-2 w-56 z-50 overflow-hidden animate-slideInFromTop"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{ 
                    right: accountDropdownPosition.right, 
                    left: accountDropdownPosition.left,
                    width: accountDropdownPosition.width
                  }}
                >
                  <div className="p-2">
                    <div className="px-4 py-3 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-xl">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Chào mừng bạn!</span>
                      </div>
                    </div>
                    <div className="py-2 space-y-1">
                      <Link
                        to="/login"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 rounded-xl group"
                        onClick={() => setShowAccountDropdown(false)}
                      >
                        <span className="mr-3 flex items-center group-hover:scale-110 transition-transform duration-200">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span className="font-medium">Đăng nhập</span>
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 rounded-xl group"
                        onClick={() => setShowAccountDropdown(false)}
                      >
                        <span className="mr-3 flex items-center group-hover:scale-110 transition-transform duration-200">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        <span className="font-medium">Đăng ký</span>
                      </Link>
                      <Link
                        to="/favorites"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 rounded-xl group"
                      >
                        <span className="mr-3 flex items-center group-hover:scale-110 transition-transform duration-200">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3 3h14a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2z" />
                          </svg>
                        </span>
                        <span className="font-medium">Yêu thích</span>
                      </Link>
                      <Link
                        to="/history"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 rounded-xl group"
                      >
                        <span className="mr-3 flex items-center group-hover:scale-110 transition-transform duration-200">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3 3h14a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2z" />
                          </svg>
                        </span>
                        <span className="font-medium">Lịch sử xem</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Cart Dropdown - Compact */}
            <div
              className="relative"
              ref={cartRef}
              onMouseEnter={handleCartMouseEnter}
              onMouseLeave={handleCartMouseLeave}
            >
              <button className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl hover:scale-110" onClick={handleCartClick}>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L17 18"
                  />
                </svg>
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse font-bold shadow-lg">
                  {cartItems.length}
                </span>
              </button>

              {showCartDropdown && (
                <motion.div
                  className="absolute top-full right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl mt-2 w-80 z-50 overflow-hidden"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{ 
                    right: cartDropdownPosition.right, 
                    left: cartDropdownPosition.left,
                    width: cartDropdownPosition.width
                  }}
                >
                  <div className="p-2">
                    <div className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-xl">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                          </svg>
                          <span>Giỏ hàng</span>
                        </span>
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-bold">
                          {cartItems.length}
                        </span>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto overflow-x-hidden py-2">
                      {cartItems.length > 0 ? (
                        cartItems.map((item, index) => (
                          <div
                            key={item.id}
                            className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group animate-slideInFromRight"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center text-2xl mr-3 group-hover:scale-110 transition-transform duration-200">
                              {item.image}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                                {item.name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Số lượng: {item.quantity}
                              </p>
                              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {formatPrice(item.price)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <div className="flex items-center justify-center mb-2">
                            <svg
                              className="w-10 h-10 text-gray-400 animate-bounce"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                          </div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Giỏ hàng trống
                          </p>
                        </div>
                      )}
                    </div>
                    {cartItems.length > 0 && (
                      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            Tổng cộng:
                          </span>
                          <span className="font-bold text-lg bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                            {formatPrice(cartTotal)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            to="/cart"
                            className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-xl text-sm font-medium text-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105"
                            onClick={() => setShowCartDropdown(false)}
                          >
                            Xem giỏ hàng
                          </Link>
                          <Link
                            to="/checkout"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-xl text-sm font-medium text-center hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
                            onClick={() => setShowCartDropdown(false)}
                          >
                            Thanh toán
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Mobile search button */}
            <button
              onClick={() => navigate("/filter")}
              className="md:hidden p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
            >
              <svg
                className="h-6 w-6"
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
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:scale-110"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu - Improved */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Mobile search */}
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm khóa học..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-4 w-4 text-gray-400"
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
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <svg
                          className="h-4 w-4"
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
                    )}
                    <button
                      type="submit"
                      className="p-1.5 mr-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5-5 5"
                        />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>

              {/* Mobile navigation links */}
              <motion.div
                className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
              >
                {/* Navigation links */}
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <Link
                      to={item.href}
                      className={`flex items-center px-4 py-2 text-base font-medium transition-all duration-200 rounded-xl ${
                        isActive(item.href)
                          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                {/* Categories */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Link
                    to="/filter"
                    className="flex items-center gap-2 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 rounded-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    Danh mục khóa học
                  </Link>
                </motion.div>

                {/* Additional mobile menu links */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Link
                    to="/favorites"
                    className="flex items-center gap-2 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 rounded-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                    </svg>
                    Khóa học yêu thích
                  </Link>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Link
                    to="/history"
                    className="flex items-center gap-2 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 rounded-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Lịch sử xem
                  </Link>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Link
                    to="/cart"
                    className="flex items-center gap-2 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 rounded-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Giỏ hàng
                    {cartItems.length > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;