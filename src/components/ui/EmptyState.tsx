interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    text: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState = ({ 
  icon = '📚', 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4" role="img" aria-label={title}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {action.text}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
