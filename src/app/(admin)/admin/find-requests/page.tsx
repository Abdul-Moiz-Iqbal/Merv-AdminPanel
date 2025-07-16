"use client";

import { useState, useEffect } from "react";
import { findRequestAPI } from "@/services/find-request";
import { IFindRequest } from "@/models/FindRequest";

export default function FindRequestsPage() {
  const [requests, setRequests] = useState<IFindRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "responded">("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const params = filter === "all" ? {} : { status: filter };
        const response = await findRequestAPI.getRequests(params);

        if (response.success) {
          setRequests(response.data.requests);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [filter]);

  const handleStatusUpdate = async (
    id: string,
    status: "pending" | "responded"
  ) => {
    setUpdating(id);
    try {
      const response = await findRequestAPI.updateStatus(id, status);

      if (response.success) {
        setRequests((prev) =>
          prev.map((req) => (req._id === id ? { ...req, status } : req))
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(null);
    }
  };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString("en-US", {
  //     year: "numeric",
  //     month: "short",
  //     day: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  const formatDate = (input: string | Date) => {
  const date = typeof input === 'string' ? new Date(input) : input;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Requests</h1>
          <p className="mt-2 text-gray-600">Manage customer product requests</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex space-x-4">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "responded", label: "Responded" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-md font-medium ${
                filter === key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.product}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.targetCountry}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          request.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.createdAt!)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleStatusUpdate(request._id!, "pending")
                          }
                          disabled={
                            updating === request._id ||
                            request.status === "pending"
                          }
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            request.status === "pending"
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          }`}
                        >
                          {updating === request._id ? "Updating..." : "Pending"}
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(request._id!, "responded")
                          }
                          disabled={
                            updating === request._id ||
                            request.status === "responded"
                          }
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            request.status === "responded"
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          {updating === request._id
                            ? "Updating..."
                            : "Responded"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {requests.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No requests found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
