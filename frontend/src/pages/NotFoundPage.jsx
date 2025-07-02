import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">Page not found</p>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Sorry, we couldn't find the page you're looking for.</p>
        
        <div className="mt-8 flex items-center justify-center space-x-4">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </Link>
          <Link 
            to="/history" 
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>View History</span>
          </Link>
        </div>
      </div>
    </div>
  );
}