import { Link } from 'react-router-dom';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
    courseCount?: number;
    price?: string;
  };
  onCategoryClick?: () => void;
  variant?: 'main' | 'compact';
}

const CategoryCard = ({ category, onCategoryClick, variant = 'main' }: CategoryCardProps) => {
  if (variant === 'compact') {
    return (
      <Link
        to={`/filter?category=${encodeURIComponent(category.id)}`}
        className="group p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-300 text-center"
        onClick={onCategoryClick}
      >
        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
          {category.icon}
        </div>
        <div className="text-xs font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight">
          {category.name}
        </div>
        {category.courseCount !== undefined && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {category.courseCount} khóa học
          </div>
        )}
      </Link>
    );
  }

  return (
    <Link
      to={`/filter?category=${encodeURIComponent(category.id)}`}
      className="group p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 category-card-main"
      onClick={onCategoryClick}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center text-3xl group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
          {category.icon}
        </div>
        <div>
          <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 text-sm leading-tight mb-1">
            {category.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {category.description}
          </div>
          {category.courseCount !== undefined && (
            <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full font-medium">
              {category.courseCount} khóa học
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
