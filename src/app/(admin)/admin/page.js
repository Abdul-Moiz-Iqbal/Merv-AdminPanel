'use client'
import VisitorStats from '@/components/VisitorStat';
import { useApiWithCache } from '@/hooks/useApiWithCache';
import { useState, useEffect, useMemo } from 'react'

export default function AdminDashboard() {
  
  const {
    data: companies,
    loading,
    error,
    refetch,
    invalidateCache,
  } = useApiWithCache("/api/company", {
    immediate: true,
    cacheKey: "all-companies",
    cacheTTL: 60 * 1000, // 1 min
  });

  // Calculate dynamic stats from companies data
  const stats = useMemo(() => {
    if (!companies || !Array.isArray(companies)) {
      return {
        pendingReviews: 0,
        totalCompanies: 0,
        approvedToday: 0,
        rejectedToday: 0
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pendingReviews = companies.filter(company => 
      company.status === 'pending' || company.status === 'under_review'
    ).length;

    const totalCompanies = companies.length;

    const approvedToday = companies.filter(company => {
      if (company.status !== 'approved') return false;
      const updatedDate = new Date(company.updatedAt || company.approvedAt);
      return updatedDate >= today && updatedDate < tomorrow;
    }).length;

    const rejectedToday = companies.filter(company => {
      if (company.status !== 'rejected') return false;
      const updatedDate = new Date(company.updatedAt || company.rejectedAt);
      return updatedDate >= today && updatedDate < tomorrow;
    }).length;

    return {
      pendingReviews,
      totalCompanies,
      approvedToday,
      rejectedToday
    };
  }, [companies]);

  // Generate recent activity from companies data
  const recentActivity = useMemo(() => {
    if (!companies || !Array.isArray(companies)) return [];

    const activities = companies
      .filter(company => company.updatedAt || company.createdAt)
      .map(company => {
        const updatedAt = new Date(company.updatedAt || company.createdAt);
        const now = new Date();
        const diffMs = now.getTime() - updatedAt.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        let timeAgo;
        if (diffDays > 0) {
          timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
          timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
          timeAgo = 'Less than an hour ago';
        }

        let action;
        switch (company.status) {
          case 'approved':
            action = 'Approved';
            break;
          case 'rejected':
            action = 'Rejected';
            break;
          case 'pending':
          case 'under_review':
            action = 'New Submission';
            break;
          default:
            action = 'Updated';
        }

        return {
          action,
          company: company.name || company.companyName || 'Unknown Company',
          time: timeAgo,
          type: company.status,
          updatedAt
        };
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 4); // Show only recent 4 activities

    return activities;
  }, [companies]);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={refetch}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={invalidateCache}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      
      {/* Loading State */}
      {loading && !companies && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/*visitor stats  */}
      <VisitorStats/>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingReviews}</p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalCompanies}</p>
            </div>
            <div className="text-3xl">🏢</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved Today</p>
              <p className="text-2xl font-bold text-green-600">{stats.approvedToday}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected Today</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejectedToday}</p>
            </div>
            <div className="text-3xl">❌</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'approved' ? 'bg-green-500' :
                    activity.type === 'rejected' ? 'bg-red-500' : 'bg-orange-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action} - {activity.company}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                </div>
              ) : (
                <p>No recent activity found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}