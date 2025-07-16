import { useState, useCallback } from 'react';
import { CohereClient } from 'cohere-ai';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { dataProcessor } from '../services/dataProcessor';
import type { CourseWithDetails } from '../services/api';

type AIModel = 'cohere' | 'gemini';

interface AIConfig {
  model: AIModel;
}

interface AIResponse {
  isLoading: boolean;
  error: string | null;
  result: string | null;
}

interface GenerateOptions {
  prompt: string;
  maxTokens: number;
  temperature: number;
  model: string;
}

interface GenerateResponse {
  generations: Array<{
    text: string;
  }>;
}

const key_cohere = "e03fITEWMwUMXsA0URRGixLeJ7KRI11b6lm58MRO";

const key_gemini = "AIzaSyDFt0fnEtTtuEUusUOLyR8gdl_FjQBjXv0";

const BASE_PROMPT = `
  Bạn là trợ lý AI của Antoree, một trang thương mại về khóa học.
  Luôn trả lời bằng tiếng Việt, thân thiện và dễ hiểu.
  Tránh sử dụng tiếng Anh hoặc thuật ngữ kỹ thuật phức tạp.
`;

export const useAIAssistant = (config: AIConfig = { 
  model: 'gemini'
}) => {
  const [cohereClient, setCohereClient] = useState<CohereClient | null>(null);
  const [geminiClient, setGeminiClient] = useState<GoogleGenerativeAI | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentModel, setCurrentModel] = useState<AIModel>(config.model);

  // Initialize Cohere client
  const initialize = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      if(config.model === 'cohere') {
        const client = new CohereClient({
          token: key_cohere
        });
        setCohereClient(client);
      }else {
        const genAI = new GoogleGenerativeAI(key_gemini);
        setGeminiClient(genAI);
      }
      setCurrentModel(config.model);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Cohere client:', error);
    }
  }, [isInitialized]);

  const generate = async (options: GenerateOptions): Promise<GenerateResponse | undefined> => {
    if (!isInitialized) {
      await initialize();
    }

    try {
      const fullPrompt = `${BASE_PROMPT}\n${options.prompt}`;

      if (currentModel === 'cohere' && cohereClient) {
        const response = await cohereClient.generate({
          prompt: fullPrompt,
          maxTokens: options.maxTokens,
          temperature: options.temperature,
          model: options.model,
        });
        return response;
      } else if (currentModel === 'gemini' && geminiClient) {
        const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return {
          generations: [{
            text: response.text()
          }]
        };
      }
    } catch (error) {
      console.error('Generate error:', error);
      return undefined;
    }
  };

  // Switch between models
  const switchModel = async (model: AIModel) => {
    setIsInitialized(false);
    config.model = model;
    await initialize();
  };

  // Course Analysis
  const analyzeCourse = async (course: CourseWithDetails): Promise<AIResponse> => {
    if (!isInitialized) {
      await initialize();
    }

    try {
      const prompt = `
        Bạn đang là một người tư vấn về khóa học. Đối tượng bạn cần trả lời là một người đang có nhu cầu về học tập.

        Hãy phân tích khóa học sau và cung cấp một phân tích chi tiết về giá trị của nó:
        1. Khóa học này có gì đặc biệt?
        2. Đối tượng mục tiêu của khóa học này?
        3. Tại sao nên chọn Antoree cho khóa học này?

        Thông tin về khóa học:
        Tên khóa học: ${course.title}
        Mô tả: ${course.description}
        Danh mục: ${course.category}
        Trình độ cần học: ${course.level}
        Thời lượng: ${course.duration_hours} giờ
        Số tiết: ${course.number_of_lectures}
        Đánh giá: ${course.rating} (${course.number_of_reviews} đánh giá)
        Giảng viên: ${course.instructor.fullname}
        Thông tin về giảng viên: ${course.instructor.bio_snippet}
        Giá: ${course.price} VND

        Kết quả học tập:
        ${course.learning_outcomes?.join('\n')}

        Cung cấp lời giải thích mượt mà và dễ hiểu, tránh sử dụng thuật ngữ kỹ thuật quá phức tạp bằng tiếng Việt.
      `;

      let result = '';

      if (currentModel === 'cohere' && cohereClient) {
        const response = await cohereClient.generate({
          prompt: `${BASE_PROMPT}\n${prompt}`,
          maxTokens: 500,
          temperature: 0.7,
          model: 'command',
        });
        result = response.generations[0].text;
      } else if (currentModel === 'gemini' && geminiClient) {
        const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
        const response = await model.generateContent(`${BASE_PROMPT}\n${prompt}`);
        const textResponse = await response.response;
        result = textResponse.text();
      } else {
        throw new Error('No AI model initialized');
      }

      return {
        isLoading: false,
        error: null,
        result: result
      };

    } catch (error) {
      console.error('Course analysis error:', error);
      return {
        isLoading: false,
        error: 'Failed to analyze course',
        result: null
      };
    }
  };

  // Course Recommendations Chat
  const getCourseRecommendations = async (
    userQuery: string,
    filters?: {
      minPrice?: number;
      maxPrice?: number;
      category?: string;
      level?: string;
    }
  ): Promise<AIResponse> => {
    if (!isInitialized) {
      await initialize();
    }

    try {
      // Get all courses
      const allCourses = dataProcessor.getAllCourses();
      
      // Apply filters if provided
      let filteredCourses = allCourses;
      if (filters) {
        filteredCourses = allCourses.filter(course => {
          const price = course.discount_price || course.price;
          if (filters.minPrice && price < filters.minPrice) return false;
          if (filters.maxPrice && price > filters.maxPrice) return false;
          if (filters.category && course.category !== filters.category) return false;
          if (filters.level && course.level !== filters.level) return false;
          return true;
        });
      }

      // Prepare courses data for AI
      const coursesData = filteredCourses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.discount_price || course.price,
        category: course.category,
        level: course.level,
        rating: course.rating,
        duration_hours: course.duration_hours,
        instructor: course.instructor.fullname
      }));

      const prompt = `
        Truy vấn của người dùng: "${userQuery}"
        
        Với những khóa học có sẵn này:
        ${JSON.stringify(coursesData)}
        
        Vui lòng đề xuất 5 khóa học phù hợp nhất cho người dùng này. Hãy cân nhắc:
        1. Nhu cầu và yêu cầu cụ thể của người dùng
        2. Khoảng giá (nếu có)
        3. Trình độ kỹ năng (nếu có)
        4. Xếp hạng và mức độ phổ biến của khóa học

        Với mỗi đề xuất, hãy giải thích lý do tại sao nó phù hợp.

        Trả về phản hồi dưới dạng một mảng JSON với cấu trúc sau:
        [
          {
            "courseId": "string",
            "reason": "lý do tại sao khóa học này phù hợp"
          }
        ]
        
        Chỉ trả về JSON Array, không có văn bản giải thích thêm.
        Đảm bảo courseId là chính xác từ danh sách khóa học đã cung cấp.
        Viết lý do bằng tiếng Việt.
      `;

      let recommendationsText = '';

      if (currentModel === 'cohere' && cohereClient) {
        const response = await cohereClient.generate({
          prompt: `${BASE_PROMPT}\n${prompt}`,
          maxTokens: 1000,
          temperature: 0.7,
          model: 'command',
        });
        recommendationsText = response.generations[0].text;
      } else if (currentModel === 'gemini' && geminiClient) {
        const model = geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
        const response = await model.generateContent(`${BASE_PROMPT}\n${prompt}`);
        const textResponse = await response.response;
        recommendationsText = textResponse.text();
      } else {
        throw new Error('No AI model initialized');
      }

      // Extract JSON from response (in case there's additional text)
      const jsonMatch = recommendationsText.match(/\[[\s\S]*\]/);
      const jsonText = jsonMatch ? jsonMatch[0] : recommendationsText;

      // Parse AI response
      const recommendations = JSON.parse(jsonText);

      // Map recommendations to full course data
      const detailedRecommendations = recommendations.map((rec: any) => {
        const matchedCourse = filteredCourses.find(c => c.id === rec.courseId);
        return {
          course: matchedCourse || { 
            id: rec.courseId, 
            title: "Khóa học không tồn tại",
            price: 0,
            slug: ""
          },
          reason: rec.reason,
          link: matchedCourse ? `/course/${matchedCourse.slug}` : ""
        };
      }).filter((rec: any) => rec.course.id !== undefined);

      return {
        isLoading: false,
        error: null,
        result: JSON.stringify(detailedRecommendations)
      };

    } catch (error) {
      console.error('Get recommendations error:', error);
      return {
        isLoading: false,
        error: 'Không thể lấy đề xuất khóa học. Vui lòng thử lại sau.',
        result: null
      };
    }
  };

  return {
    isInitialized,
    initialize,
    generate,
    analyzeCourse,
    getCourseRecommendations,
    switchModel,
    currentModel
  };
};