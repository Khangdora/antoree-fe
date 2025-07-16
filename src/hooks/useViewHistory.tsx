import { useState, useEffect } from 'react';
import { dataProcessor } from '../services/dataProcessor';
import type { Course } from '../services/api';

const VIEW_HISTORY_KEY = 'antoree_view_history';
const MAX_HISTORY_ITEMS = 20;

export const useViewHistory = () => {
  const [viewHistory, setViewHistory] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from localStorage
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const historyIds = JSON.parse(localStorage.getItem(VIEW_HISTORY_KEY) || '[]');
        const courses = [];
        
        for (const id of historyIds) {
          const course = dataProcessor.getCourseById(id);
          if (course) {
            courses.push(course);
          }
        }
        
        setViewHistory(courses);
      } catch (error) {
        console.error('Error loading view history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHistory();
  }, []);

  // Add a course to view history
  const addToViewHistory = async (courseId: string) => {
    try {
      // Get current history
      const historyIds = JSON.parse(localStorage.getItem(VIEW_HISTORY_KEY) || '[]');
      
      // Remove if already exists (to move to top)
      const filteredIds = historyIds.filter((id: string) => id !== courseId);
      
      // Add to beginning
      const newHistoryIds = [courseId, ...filteredIds].slice(0, MAX_HISTORY_ITEMS);
      
      // Save back to localStorage
      localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(newHistoryIds));
      
      // Update state
      const course = dataProcessor.getCourseById(courseId);
      if (course) {
        setViewHistory(prev => {
          const filteredHistory = prev.filter(c => c.id !== courseId);
          return [course, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
        });
      }
    } catch (error) {
      console.error('Error adding to view history:', error);
    }
  };

  // Clear all history
  const clearViewHistory = () => {
    localStorage.removeItem(VIEW_HISTORY_KEY);
    setViewHistory([]);
  };

  // Remove single item from history
  const removeFromHistory = (courseId: string) => {
    try {
      const historyIds = JSON.parse(localStorage.getItem(VIEW_HISTORY_KEY) || '[]');
      const newHistoryIds = historyIds.filter((id: string) => id !== courseId);
      localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(newHistoryIds));
      
      setViewHistory(prev => prev.filter(course => course.id !== courseId));
    } catch (error) {
      console.error('Error removing from history:', error);
    }
  };

  return {
    viewHistory,
    isLoading,
    addToViewHistory,
    clearViewHistory,
    removeFromHistory
  };
};