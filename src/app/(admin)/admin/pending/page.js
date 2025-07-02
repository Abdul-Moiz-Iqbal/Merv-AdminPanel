"use client";
import { useApiWithCache } from "@/hooks/useApiWithCache";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function PendingReviews() {
  const {
    data: pendingCompanies,
    loading,
    error,
    refetch,
    invalidateCache,
  } = useApiWithCache("/api/company", {
    immediate: true,
    cacheKey: "all-companies",
    cacheTTL: 60 * 1000, // 1 min
  });
  console.log(pendingCompanies);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleApprove = async (companyId) => {
    // API call to approve company
    const res = await fetch(`/api/company/${companyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "approved" }),
    });
    console.log(res);
    console.log("Approving company:", companyId);
    invalidateCache();

    setShowModal(false);
  };

  const handleReject = async (companyId) => {
    const res = await fetch(`/api/company/${companyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "reject" }),
    });
    console.log(res);
    console.log("Rejected company:", companyId);
    invalidateCache();
    setShowModal(false);
  };

  const handleBulkApprove = async (action) => {
    try {
      const companies = pendingCompanies.filter(
        (company) => company.status == "pending"
      );
      console.log(companies);
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companies, action }),
      });
      console.log(res);
      invalidateCache();
    } catch (error) {
      console.log("error in Bulk approve", error);
    }
  };

  const handleRefresh = () => {
    invalidateCache();
  };

  const openModal = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  if (loading && !pendingCompanies) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading companies...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-400 mr-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-red-800">Error loading companies: {error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending Reviews</h1>
        <div className="flex space-x-3">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={() => {
              handleBulkApprove(1);
            }}
          >
            Bulk Approve Selected
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            onClick={() => {
              handleBulkApprove(0);
            }}
          >
            Bulk Reject Selected
          </button>
        </div>
      </div>

      {/* Pending Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingCompanies?.map(
          (company) =>
            company.status == "pending" && (
              <div
                key={company._id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {company.name}
                    </h3>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      {company.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Contact:</span>{" "}
                      {company.contact}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span>{" "}
                      {company.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span>{" "}
                      {company.phone}
                    </p>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {company.productDescription.en}
                  </p>

                  {company.logo && (
                    <div className="relative mb-4 w-full h-32 ">
                      <Image
                        src={company.logo}
                        alt="Company"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(company)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Review Details
                    </button>
                    <button
                      onClick={() => handleApprove(company._id)}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleReject(company._id)}
                      className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                    >
                      ✗
                    </button>
                  </div>
                </div>
              </div>
            )
        )}
      </div>

      {/* Review Modal */}
      {showModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Review Company Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Company Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedCompany.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Contact Person
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedCompany.contact}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedCompany.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedCompany.phone}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Product & Media
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Product Description
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedCompany.productDescription.en}
                      </p>
                    </div>
                    {selectedCompany.logo && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Uploaded Image
                        </label>

                        <div className="mb-4 relative w-full h-32 ">
                          <Image
                            src={selectedCompany.logo}
                            alt="Company"
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedCompany._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedCompany._id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
