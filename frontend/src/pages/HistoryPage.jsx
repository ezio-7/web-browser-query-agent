import { useState, useEffect } from 'react';
import SearchHistory from '../components/SearchHistory';
import ExportButton from '../components/ExportButton';
import { searchApi } from '../api/searchApi';

export default function HistoryPage() {
  const [allQueries, setAllQueries] = useState([]);

  useEffect(() => {
    loadAllQueries();
  }, []);

  const loadAllQueries = async () => {
    try {
      const data = await searchApi.getHistory();
      setAllQueries(data.queries || []);
    } catch (error) {
      console.error('Failed to load queries:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Search History</h1>
          <p className="text-gray-600 dark:text-gray-400">Browse through all your previous searches</p>
        </div>
        {allQueries.length > 0 && (
          <ExportButton 
            data={allQueries} 
            filename="search-history"
          />
        )}
      </div>
      
      <SearchHistory />
    </div>
  );
}