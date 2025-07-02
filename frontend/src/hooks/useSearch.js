import { useState, useCallback } from 'react';
import { searchApi } from '../api/searchApi';

export const useSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResult, setSearchResult] = useState(null);

  const search = useCallback(async (query) => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      const result = await searchApi.search(query);
      setSearchResult(result);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResult(null);
    setError(null);
  }, []);

  return {
    search,
    clearSearch,
    isLoading,
    error,
    searchResult,
  };
};