// app/admin/hotels/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { IHotel } from "@/models/Hotel";
import { hotelAPI } from "@/services/hotelService";
import Link from "next/link";
import Image from "next/image";

export default function HotelsAdminPage() {
  const [hotels, setHotels] = useState<IHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    city: "",
    isActive: "",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const cities = [
    "Hanoi",
    "Ho Chi Minh",
    "Da Nang",
    "Hoi An",
    "Nha Trang",
    "Phu Quoc",
    "Sapa",
    "Hue",
    "Can Tho",
    "Vung Tau",
  ];

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filterParams = {
        ...filters,
        isActive:
          filters.isActive === "" ? undefined : filters.isActive === "true",
        city: filters.city || undefined,
      };
      console.log(filters);

      const response = await hotelAPI.getHotels(filterParams);

      if (response.success && response.data) {
        setHotels(response.data.hotels);
        setPagination(response.data.pagination);
      } else {
        setError(response.error || "Failed to fetch hotels");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filters]); // fetchHotels will only change when filters change

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);
  
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hotel?")) return;

    try {
      const response = await hotelAPI.deleteHotel(id);

      if (response.success) {
        fetchHotels(); // Refresh the list
      } else {
        setError(response.error || "Failed to delete hotel");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await hotelAPI.toggleHotelStatus(id, !currentStatus);

      if (response.success) {
        fetchHotels(); // Refresh the list
      } else {
        setError(response.error || "Failed to update hotel status");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while updating status");
    }
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const formatPrice = (priceRange: { min: number; max: number }) => {
    return `$${priceRange.min} - $${priceRange.max}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading hotels...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Hotel Management
            </h1>
            <Link
              href="/admin/hotels/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Hotel
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange("isActive", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt">Created Date</option>
                <option value="name">Name</option>
                <option value="city">City</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  handleFilterChange("sortOrder", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Hotels Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hotel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hotels.map((hotel) => (
                <tr key={hotel._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Image
                        src={hotel.image || "/images/hotel-placeholder.jpg"}
                        alt={hotel.name}
                        width={48} // equivalent to w-12
                        height={48} // equivalent to h-12
                        className="rounded-lg object-cover mr-4"
                        onError={(e) => {
                          e.currentTarget.src = "/images/hotel-placeholder.jpg";
                        }}
                      />

                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {hotel.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {hotel.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {hotel.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(hotel.priceRange)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">
                        {hotel.rating}
                      </span>
                      <span className="ml-1 text-yellow-400">★</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        hotel.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {hotel.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/hotels/${hotel._id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() =>
                        handleToggleStatus(hotel._id!, hotel.isActive)
                      }
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      {hotel.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(hotel._id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {hotels.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hotels found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pagination.hasPrev
                    ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Previous
              </button>

              {[...Array(pagination.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pageNum === pagination.page
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pagination.hasNext
                    ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
