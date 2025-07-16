import { useState, useEffect } from 'react';
import { getCourseById } from '../services/api';
import type { Course } from '../services/api';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from localStorage and fetch course details
  const loadFavorites = async () => {
    try {
      const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
      const coursesData = await Promise.all(
        favoriteIds.map((id: string) => getCourseById(id))
      );
      setFavorites(coursesData.filter(Boolean) as Course[]);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const addFavorite = async (courseId: string) => {
    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
    const newFavoriteIds = [...favoriteIds, courseId];
    localStorage.setItem('favorites', JSON.stringify(newFavoriteIds));
    await loadFavorites(); // Reload favorites to get course details
  };

  const removeFavorite = async (courseId: string) => {
    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
    const newFavoriteIds = favoriteIds.filter((id: string) => id !== courseId);
    localStorage.setItem('favorites', JSON.stringify(newFavoriteIds));
    setFavorites(prev => prev.filter(course => course.id !== courseId));
  };

  const isFavorite = (courseId: string) => {
    const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favoriteIds.includes(courseId);
  };

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    loadFavorites
  };
};