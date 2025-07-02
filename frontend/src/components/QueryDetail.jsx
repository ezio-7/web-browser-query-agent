import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Globe, Archive } from 'lucide-react';
import { searchApi } from '../api/searchApi';
import { formatDate } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function QueryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [queryData, setQueryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQueryDetails();
  }, [id]);

  const loadQueryDetails = async () => {
    try {
      const data = await searchApi.getQueryDetails(id);
      setQueryData(data);
    } catch (error) {
      setError('Failed to load query details');
      console.error('Failed to load query details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!queryData) return <ErrorMessage message="Query not found" />;

  const { query, summary, sources } = queryData;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{query.original_query}</h1>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(query.created_at)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Archive className="h-4 w-4" />
            <span>Cached Result</span>
          </div>
        </div>

        {summary && (
          <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Summary</h2>
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{summary}</p>
          </div>
        )}

        {sources && sources.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sources</h2>
            <div className="space-y-3">
              {sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all duration-200 group"
                >
                  <Globe className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 mt-0.5 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {source.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{source.url}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Scraped on {formatDate(source.scraped_at)}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}