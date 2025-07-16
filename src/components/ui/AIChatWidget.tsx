import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIAssistant } from "../../hooks/useAIAssistant";
import { Link } from "react-router-dom";
import ReactDOMServer from "react-dom/server";

type AIModel = "cohere" | "gemini";

interface Message {
  type: "user" | "ai";
  content: string;
  isRecommendation?: boolean;
  isHTML?: boolean;
  model?: AIModel;
}

export const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>("gemini");

  const ai = useAIAssistant({
    model: selectedModel,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message when chat is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          type: "ai",
          content:
            "Xin chào! Tôi là trợ lý AI của Antoree. Tôi có thể giúp bạn tìm kiếm khóa học phù hợp hoặc trả lời các câu hỏi về khóa học. Bạn cần giúp đỡ gì không?",
          model: selectedModel,
        },
      ]);
    }
  }, [isOpen]);

  const handleModelChange = async (model: AIModel) => {
    setSelectedModel(model);
    await ai.switchModel(model);
    // Thêm thông báo về việc chuyển model
    setMessages((prev) => [
      ...prev,
      {
        type: "ai",
        content: `Đã chuyển sang model ${
          model === "gemini" ? "Google Gemini" : "Cohere"
        }.`,
        model: model,
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    // Analyze user intent
    try {
      const intentPrompt = `
        Phân tích ý định của người dùng trong tin nhắn sau: "${userMessage}"
        
        Trả về "chat" nếu người dùng đang trò chuyện thông thường.
        Trả về "recommendation" nếu người dùng đang tìm kiếm hoặc hỏi về khóa học.
        
        Chỉ trả về một từ: "chat" hoặc "recommendation".
        
        Ví dụ:
        - "Chào bạn" -> "chat"
        - "Tôi muốn học lập trình" -> "recommendation"
        - "Khóa học nào phù hợp với tôi?" -> "recommendation"
        - "Bạn có thể làm gì?" -> "chat"
        - "Cảm ơn bạn" -> "chat"
      `;

      const intentResponse = await ai.generate({
        prompt: intentPrompt,
        maxTokens: 1,
        temperature: 0.1,
        model: "command",
      });

      const intent = intentResponse?.generations[0].text.trim().toLowerCase();

      if (intent === "recommendation") {
        // User needs course recommendations
        const response = await ai.getCourseRecommendations(userMessage);

        if (response.result) {
          const recommendations = JSON.parse(response.result);

          const formattedResponse = (
            <div className="space-y-4">
              <p>Dựa trên yêu cầu của bạn, tôi đề xuất các khóa học sau:</p>
              {recommendations.map((rec: any, index: number) => (
                <div
                  key={index}
                  className="p-3 border border-purple-100 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-900/10"
                >
                  <Link
                    to={rec.link}
                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline block mb-1"
                  >
                    {index + 1}. {rec.course.title}
                  </Link>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>💰 {rec.course.price.toLocaleString("vi-VN")}đ</span>
                    {rec.course.rating && (
                      <span>⭐ {rec.course.rating}/5.0</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {rec.reason}
                  </p>
                </div>
              ))}
            </div>
          );

          // Chuyển JSX thành HTML string để lưu trong message
          const htmlContent = ReactDOMServer.renderToString(formattedResponse);

          setMessages((prev) => [
            ...prev,
            {
              type: "ai",
              content: htmlContent,
              isRecommendation: true,
              isHTML: true,
              model: selectedModel,
            },
          ]);
        }
      } else {
        // General chat
        const chatPrompt = `
            Người dùng nói: "${userMessage}"
            
            Hãy trả lời một cách thân thiện và hữu ích bằng tiếng Việt.
            Nếu thấy người dùng có thể quan tâm đến việc học, hãy gợi ý họ có thể hỏi bạn về các khóa học phù hợp.
            
            Quy tắc:
            1. Luôn trả lời bằng tiếng Việt
            2. Giọng điệu thân thiện, gần gũi
            3. Câu trả lời ngắn gọn, dễ hiểu
            4. Nếu không hiểu câu hỏi, có thể hỏi lại để làm rõ
        `;

        const chatResponse = await ai.generate({
          prompt: chatPrompt,
          maxTokens: 200,
          temperature: 0.7,
          model: "command",
        });

        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            content:
              chatResponse?.generations[0].text ||
              "Xin lỗi, tôi không hiểu. Bạn có thể nói rõ hơn được không?",
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
          model: selectedModel,
        },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 cursor-pointer">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[380px] mb-4 overflow-hidden"
          >
            {/* Chat Header */}
            <div className="p-4 border-b dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z"
                        fill="currentColor"
                      />
                      <path
                        d="M12 13.5C12.8284 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12C10.5 12.8284 11.1716 13.5 12 13.5Z"
                        fill="white"
                      />
                      <path
                        d="M16.5 13.5C17.3284 13.5 18 12.8284 18 12C18 11.1716 17.3284 10.5 16.5 10.5C15.6716 10.5 15 11.1716 15 12C15 12.8284 15.6716 13.5 16.5 13.5Z"
                        fill="white"
                      />
                      <path
                        d="M7.5 13.5C8.32843 13.5 9 12.8284 9 12C9 11.1716 8.32843 10.5 7.5 10.5C6.67157 10.5 6 11.1716 6 12C6 12.8284 6.67157 13.5 7.5 13.5Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      Trợ lý AI Antoree
                    </h3>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedModel}
                        onChange={(e) =>
                          handleModelChange(e.target.value as AIModel)
                        }
                        className="bg-white/20 text-black rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-white/50"
                        disabled={isLoading}
                      >
                        <option value="gemini">Gemini</option>
                        <option value="cohere">Cohere</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
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
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.type === "user"
                        ? "bg-blue-600 text-white"
                        : msg.isRecommendation
                        ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    {msg.type === "ai" && msg.model && (
                      <div className="flex justify-end mb-1">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 italic">
                          {msg.model === "gemini" ? "Google AI" : "Cohere AI"}
                        </span>
                      </div>
                    )}
                    {msg.isHTML ? (
                      <div
                        className="whitespace-normal font-sans text-sm"
                        dangerouslySetInnerHTML={{ __html: msg.content }}
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {msg.content}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t dark:border-gray-700"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhắn tin với trợ lý AI..."
                  className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Gửi
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center cursor-pointer"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
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
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};