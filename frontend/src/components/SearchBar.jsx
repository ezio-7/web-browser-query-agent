import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';
import { searchApi } from '../api/searchApi';
import { useDebounce } from '../hooks/useDebounce';

export default function SearchBar({ onSearch, isLoading, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length > 2) {
      loadSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSuggestions = async () => {
    try {
      const results = await searchApi.getSuggestions(debouncedQuery);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="w-full relative" ref={suggestionsRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Ask me anything... (Press / to focus)"
            className={clsx(
              "block w-full pl-10 pr-12 py-4 border rounded-lg",
              "text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
              "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "transition-all duration-200",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
            disabled={isLoading}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-12 flex items-center pr-3"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={clsx(
              "absolute inset-y-0 right-0 flex items-center pr-3",
              "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
              "disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed",
              "transition-colors duration-200"
            )}
          >
            <div className="p-2">
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
              ) : (
                <Search className="h-5 w-5" />
              )}
            </div>
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={clsx(
                "w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700",
                "text-gray-900 dark:text-white transition-colors",
                index === selectedIndex && "bg-gray-50 dark:bg-gray-700",
                index === 0 && "rounded-t-lg",
                index === suggestions.length - 1 && "rounded-b-lg"
              )}
            >
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                <span>{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}