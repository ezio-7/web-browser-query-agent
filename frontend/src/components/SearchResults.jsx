import { CheckCircle, ExternalLink, Archive } from 'lucide-react';
import clsx from 'clsx';

export default function SearchResults({ result }) {
  if (!result) return null;

  const { status, message, from_cache, summary, sources } = result;

  if (status === 'invalid') {
    return (
      <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-slide-up">
        <p className="text-red-800 dark:text-red-300">{message}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6 animate-fade-in">
      {from_cache && (
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <Archive className="h-5 w-5" />
          <span className="text-sm font-medium">Results from cache</span>
        </div>
      )}

      {summary && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">{summary}</p>
            </div>
          </div>
        </div>
      )}

      {sources && sources.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sources</h3>
          <div className="space-y-3">
            {sources.map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  "flex items-start space-x-3 p-3 rounded-lg",
                  "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200",
                  "group"
                )}
              >
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{index + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {source.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{source.url}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}