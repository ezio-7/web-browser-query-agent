import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { searchApi } from '../api/searchApi';
import { groupQueriesByDate } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import clsx from 'clsx';

export default function SearchHistory() {
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const itemsPerPage = 20;

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await searchApi.getHistory();
      setQueries(data.queries || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.query.toLowerCase().includes(searchTerm.toLowerCase());
    const queryDate = new Date(query.created_at);
    
    let matchesDate = true;
    if (startDate && endDate) {
      matchesDate = queryDate >= startDate && queryDate <= endDate;
    } else if (startDate) {
      matchesDate = queryDate >= startDate;
    } else if (endDate) {
      matchesDate = queryDate <= endDate;
    }

    return matchesSearch && matchesDate;
  });

  const groupedQueries = groupQueriesByDate(filteredQueries);
  
  // Pagination logic
  const totalPages = Math.ceil(filteredQueries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  let currentItems = [];
  let itemCount = 0;
  let paginatedGroups = [];
  
  for (const group of groupedQueries) {
    const groupCopy = { ...group, queries: [] };
    
    for (const query of group.queries) {
      if (itemCount >= startIndex && itemCount < endIndex) {
        groupCopy.queries.push(query);
      }
      itemCount++;
    }
    
    if (groupCopy.queries.length > 0) {
      paginatedGroups.push(groupCopy);
    }
  }

  const handleQueryClick = (query) => {
    navigate(`/query/${query.id}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange([null, null]);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search history..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                "ml-4 px-4 py-2 rounded-md flex items-center space-x-2 transition-colors",
                showFilters 
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 animate-slide-up">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date Range
                  </label>
                  <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => {
                      setDateRange(update);
                      setCurrentPage(1);
                    }}
                    isClearable={true}
                    placeholderText="Select date range"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={clearFilters}
                  className="mt-6 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {paginatedGroups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || startDate || endDate ? 'No matching searches found.' : 'No search history yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-8">
            {paginatedGroups.map((group) => (
              <div key={group.date}>
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{group.displayDate}</h3>
                </div>
                <div className="space-y-2">
                  {group.queries.map((query) => (
                    <div
                      key={query.id}
                      onClick={() => handleQueryClick(query)}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all duration-200 cursor-pointer group"
                    >
                      <p className="text-base text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {query.query}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 rounded-lg">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredQueries.length)}</span> of{' '}
                    <span className="font-medium">{filteredQueries.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-offset-0">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}