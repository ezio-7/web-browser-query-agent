import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Search, Hash } from 'lucide-react';
import { searchApi } from '../api/searchApi';
import LoadingSpinner from './LoadingSpinner';
import { format, subDays, startOfDay } from 'date-fns';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Analytics() {
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalQueries: 0,
    uniqueQueries: 0,
    avgQueriesPerDay: 0,
    topQueries: [],
    queryTrends: [],
    hourlyDistribution: [],
    cacheHitRate: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await searchApi.getHistory();
      const allQueries = data.queries || [];
      setQueries(allQueries);
      
      const uniqueTexts = new Set(allQueries.map(q => q.query.toLowerCase()));
      const totalQueries = allQueries.length;
      const uniqueQueries = uniqueTexts.size;
      
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = startOfDay(subDays(new Date(), i));
        return {
          date: format(date, 'MMM dd'),
          count: 0
        };
      }).reverse();
      
      allQueries.forEach(query => {
        const queryDate = startOfDay(new Date(query.created_at));
        const dayIndex = last7Days.findIndex(day => 
          format(queryDate, 'MMM dd') === day.date
        );
        if (dayIndex !== -1) {
          last7Days[dayIndex].count++;
        }
      });
      
      const queryCount = {};
      allQueries.forEach(query => {
        const text = query.query.toLowerCase();
        queryCount[text] = (queryCount[text] || 0) + 1;
      });
      
      const topQueries = Object.entries(queryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([query, count]) => ({ query, count }));
      
      const hourlyDist = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: 0
      }));
      
      allQueries.forEach(query => {
        const date = new Date(query.created_at);
        const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
        const hour = istDate.getHours();
        hourlyDist[hour].count++;
      });
            
      const cacheHitRate = uniqueQueries > 0 ? ((totalQueries - uniqueQueries) / totalQueries * 100).toFixed(1) : 0;
      
      setAnalytics({
        totalQueries,
        uniqueQueries,
        avgQueriesPerDay: (totalQueries / 7).toFixed(1),
        topQueries,
        queryTrends: last7Days,
        hourlyDistribution: hourlyDist,
        cacheHitRate
      });
      
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Queries</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{analytics.totalQueries}</p>
            </div>
            <Search className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Queries</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{analytics.uniqueQueries}</p>
            </div>
            <Hash className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Queries/Day</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{analytics.avgQueriesPerDay}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cache Hit Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{analytics.cacheHitRate}%</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Query Trends (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.queryTrends}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="date" className="text-gray-600 dark:text-gray-400" />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
                name="Queries"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Queries</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topQueries} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis type="number" className="text-gray-600 dark:text-gray-400" />
              <YAxis dataKey="query" type="category" width={150} className="text-gray-600 dark:text-gray-400" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Count">
                {analytics.topQueries.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hourly Query Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.hourlyDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="hour" 
                className="text-gray-600 dark:text-gray-400"
                tickFormatter={(hour) => `${hour}:00`}
              />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip 
                content={<CustomTooltip />}
                labelFormatter={(hour) => `${hour}:00`}
              />
              <Bar dataKey="count" fill="#10B981" name="Queries" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}