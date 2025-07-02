import Analytics from '../components/Analytics';

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Insights into your search patterns and usage statistics</p>
      </div>
      
      <Analytics />
    </div>
  );
}