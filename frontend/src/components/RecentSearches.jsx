import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Sparkles } from 'lucide-react';
import { searchApi } from '../api/searchApi';
import { formatDate } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';

export default function RecentSearches({ onQueryClick }) {
  const [recentQueries, setRecentQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const data = await searchApi.getHistory(5);
      setRecentQueries(data.queries || []);
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (recentQueries.length === 0) {
    return (
      <div className="mt-12 text-center">
        <Sparkles className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No recent searches yet. Try searching for something!</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <span>Recent Searches</span>
        </h2>
        <Link
          to="/history"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1 transition-colors"
        >
          <span>View all history</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {recentQueries.map((query) => (
          <div
            key={query.id}
            onClick={() => onQueryClick(query)}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {query.query}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatDate(query.created_at)}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 ml-4 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}