'use client';

import { useState, useEffect } from 'react';

interface VisitorData {
  _id: string;
  ip: string;
  userAgent: string;
  visitedAt: string;
}

export default function VisitorStats() {
  const [totalVisitors, setTotalVisitors] = useState<number>(0);
  const [recentVisitors, setRecentVisitors] = useState<VisitorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVisitorStats();
  }, []);

  const fetchVisitorStats = async () => {
    try {
      setLoading(true);
      
      // Fetch total count
      const countResponse = await fetch('/api/visitors');
      const countData = await countResponse.json();
      
      if (countData.success) {
        setTotalVisitors(countData.totalVisitors);
      }
      
      // Fetch recent visitors (you'll need to create this endpoint)
      const recentResponse = await fetch('/api/visitors/recent');
      const recentData = await recentResponse.json();
      
      if (recentData.success) {
        setRecentVisitors(recentData.visitors);
      }
      
    } catch (err) {
      setError('Failed to fetch visitor statistics');
      console.error('Error fetching visitor stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    fetchVisitorStats();
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={refreshStats}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 my-5">
      {/* Total Visitors Card */}
      <div className="p-6 bg-white rounded-lg shadow-md border">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Total Visitors
            </h2>
            <p className="text-3xl font-bold text-blue-600">
              {totalVisitors.toLocaleString()}
            </p>
          </div>
          <button
            onClick={refreshStats}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Recent Visitors Table */}
      <div className="p-6 bg-white rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Visitors
        </h3>
        
        {recentVisitors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    IP Address
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    User Agent
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Visit Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentVisitors.map((visitor) => (
                  <tr key={visitor._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {visitor.ip}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 max-w-xs truncate">
                      {visitor.userAgent}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {new Date(visitor.visitedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No visitor data available.</p>
        )}
      </div>
    </div>
  );
}