import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import RecentSearches from '../components/RecentSearches';
import ErrorMessage from '../components/ErrorMessage';
import { useSearch } from '../hooks/useSearch';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export default function HomePage() {
  const navigate = useNavigate();
  const { search, clearSearch, isLoading, error, searchResult } = useSearch();
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef(null);

  useKeyboardShortcuts([
    { 
      key: '/', 
      callback: () => {
        searchInputRef.current?.focus();
      } 
    }
  ]);

  const handleSearch = async (query) => {
    await search(query);
    setShowResults(true);
    
    if (!error) {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleQueryClick = (query) => {
    navigate(`/query/${query.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in">
          Ask Anything, Get Smart Answers
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 animate-fade-in animation-delay-200">
          AI-powered search with intelligent caching for instant results
        </p>
      </div>

      <div className="animate-slide-up">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {error && (
        <div className="mt-8 animate-fade-in">
          <ErrorMessage message={error} />
        </div>
      )}

      {showResults && searchResult && (
        <SearchResults result={searchResult} />
      )}

      {!showResults && !error && (
        <div className="animate-fade-in animation-delay-400">
          <RecentSearches onQueryClick={handleQueryClick} />
        </div>
      )}

      <div className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+K</kbd> for keyboard shortcuts</p>
      </div>
    </div>
  );
}