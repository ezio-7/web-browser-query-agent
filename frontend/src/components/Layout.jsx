import { Link, useLocation } from 'react-router-dom';
import { Search, Clock, Home, Moon, Sun, BarChart, Command } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useState, useEffect } from 'react';

export default function Layout({ children }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [showShortcuts, setShowShortcuts] = useState(false);

  useKeyboardShortcuts([
    { key: '/', callback: () => document.querySelector('input[type="text"]')?.focus() },
    { key: 'k', ctrlKey: true, callback: () => setShowShortcuts(!showShortcuts) },
    { key: 'Escape', callback: () => setShowShortcuts(false) },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-semibold text-gray-900 dark:text-white">Query Agent</span>
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link
                to="/history"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                  location.pathname === '/history' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>History</span>
              </Link>
              <Link
                to="/analytics"
                className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                  location.pathname === '/analytics' 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <BarChart className="h-4 w-4" />
                <span>Analytics</span>
              </Link>
              
              <div className="flex items-center space-x-4 ml-6 border-l border-gray-200 dark:border-gray-700 pl-6">
                <button
                  onClick={() => setShowShortcuts(!showShortcuts)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  title="Keyboard shortcuts (Ctrl+K)"
                >
                  <Command className="h-4 w-4" />
                </button>
                <button
                  onClick={toggleTheme}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 Query Agent. AI-powered search with intelligent caching.
          </p>
        </div>
      </footer>

      {showShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Focus search</span>
                <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">/</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Show shortcuts</span>
                <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl + K</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Close modal</span>
                <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}