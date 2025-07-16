import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIAssistant } from "../../hooks/useAIAssistant";
import type { CourseWithDetails } from "../../services/api";

type AIModel = "cohere" | "gemini";

interface AIAnalysisButtonProps {
  course: CourseWithDetails;
}

export const AIAnalysisButton = ({ course }: AIAnalysisButtonProps) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>("gemini");

  const ai = useAIAssistant({
    model: selectedModel,
  });

  const handleModelChange = async (model: AIModel) => {
    setSelectedModel(model);
    await ai.switchModel(model);
    // Nếu đang hiển thị phân tích, đóng lại
    if (showAnalysis) {
      setShowAnalysis(false);
    }
  };

  const handleAnalyze = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const response = await ai.analyzeCourse(course);
    setIsLoading(false);

    if (response.result) {
      setAnalysis(response.result);
      setShowAnalysis(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isLoading ? "cursor-wait" : "cursor-pointer"
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>AI đang phân tích...</span>
            </>
          ) : (
            <>
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Phân tích bằng AI</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Model:
          </span>
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value as AIModel)}
            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            disabled={isLoading}
          >
            <option value="gemini">Gemini</option>
            <option value="cohere">Cohere</option>
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showAnalysis && analysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {selectedModel === "gemini" ? "Google AI" : "Cohere AI"}
                  </span>
                </div>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                {analysis.split("\n").map(
                  (paragraph, index) =>
                    paragraph.trim() && (
                      <p
                        key={index}
                        className="text-gray-600 dark:text-gray-300"
                      >
                        {paragraph}
                      </p>
                    )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};