"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useApiWithCache } from "@/hooks/useApiWithCache";

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export default function AddCompany() {
  const router = useRouter();

  const { invalidateCache } = useApiWithCache(
    "http://localhost:3000/api/company",
    {
      immediate: false,
      cacheKey: "all-companies",
    }
  );

  //   const [formData, setFormData] = useState({
  //     name: "",
  //     contact: "",
  //     email: "",
  //     phone: "",
  //     productDescription: "",
  //     logo: "",
  //     logoPublicId: "",
  //     file: File | null,
  //   });

  const [formData, setFormData] = useState<{
    name: string;
    contact: string;
    email: string;
    phone: string;
    productDescription: string;
    logo: string;
    logoPublicId: string;
    file: File | null;
  }>({
    name: "",
    contact: "",
    email: "",
    phone: "",
    productDescription: "",
    logo: "",
    logoPublicId: "",
    file: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Safe access with optional chaining
    console.log(file);
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file only");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      setFormData({ ...formData, file });

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          setPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);

      await uploadToCloudinary(file);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    setIsUploading(true);
    console.log(file);
    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append("file", file);
      formDataToUpload.append("folder", "companies");

      console.log(formDataToUpload.getAll("file"));
      const response = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formDataToUpload,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      const uploadData: CloudinaryUploadResult = result.data;

      setFormData((prev) => ({
        ...prev,
        logo: uploadData.secure_url,
        logoPublicId: uploadData.public_id,
      }));

      console.log("Upload successful:", uploadData);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
      // Reset file input
      setFormData((prev) => ({ ...prev, file: null }));
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    // Delete from Cloudinary if uploaded
    if (formData.logoPublicId) {
      try {
        await fetch(
          `/api/upload/cloudinary?publicId=${formData.logoPublicId}`,
          {
            method: "DELETE",
          }
        );
      } catch (error) {
        console.error("Failed to delete from Cloudinary:", error);
      }
    }

    setFormData({
      ...formData,
      file: null,
      logo: "",
      logoPublicId: "",
    });
    setPreview(null);
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageUrl = e.target.value;
    setFormData({ ...formData, logo: imageUrl, logoPublicId: "" });

    // Clear file upload if URL is provided
    if (imageUrl) {
      setFormData((prev) => ({ ...prev, file: null }));
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ensure we have either uploaded file or URL
      if (!formData.logo) {
        alert("Please upload an image or provide an image URL");
        return;
      }

      const submitData = {
        name: formData.name,
        contact: formData.contact,
        email: formData.email,
        phone: formData.phone,
        productDescription: formData.productDescription,
        logo: formData.logo,
        logoPublicId: formData.logoPublicId,
      };

      const response = await fetch("/api/company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error("Failed to create company");
      }

      invalidateCache();
      router.push("/admin/companies");
    } catch (error) {
      console.error("Error creating company:", error);
      alert("Failed to create company. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    // Delete from Cloudinary if uploaded
    if (formData.logoPublicId) {
      try {
        await fetch(
          `/api/upload/cloudinary?publicId=${formData.logoPublicId}`,
          {
            method: "DELETE",
          }
        );
      } catch (error) {
        console.error("Failed to delete from Cloudinary:", error);
      }
    }

    setFormData({
      name: "",
      contact: "",
      email: "",
      phone: "",
      productDescription: "",
      logo: "",
      logoPublicId: "",
      file: null,
    });
    setPreview(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Company</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter company name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter contact person name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Information
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description *
                </label>
                <textarea
                  value={formData.productDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productDescription: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your product or service"
                  required
                />
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Company Logo *
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Logo Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      id="file-upload"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`cursor-pointer ${
                        isUploading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="text-gray-500">
                        <svg
                          className="w-12 h-12 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 48 48"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          />
                        </svg>
                        <p className="text-lg font-medium">
                          {isUploading
                            ? "Uploading..."
                            : "Click to upload logo"}
                        </p>
                        <p className="text-sm">PNG, JPG up to 10MB</p>
                      </div>
                    </label>
                  </div>

                  {formData.file && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            🖼️
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formData.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                              {formData.logoPublicId &&
                                " • Uploaded to Cloudinary"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-red-500 hover:text-red-700"
                          disabled={isUploading}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}

                  {preview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Preview:
                      </p>
                      {/* <img
                        src={preview}
                        alt="Preview"
                        className="w-48 h-48 object-cover rounded-lg border"
                      /> */}
                      <Image
                        src={preview}
                        alt="Preview"
                        width={192} // Example width
                        height={192} // Example height
                        className="w-48 h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                <div className="text-center text-gray-500">or</div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={
                      formData.logo && !formData.logoPublicId
                        ? formData.logo
                        : ""
                    }
                    onChange={handleImageUrlChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/logo.jpg"
                    disabled={!!formData.file}
                  />
                  {formData.logo && !formData.logoPublicId && (
                    <div className="mt-3">
                      {/* <img
                        src={formData.logo}
                        alt="URL Preview"
                        className="w-48 h-48 object-cover rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      /> */}
                      <Image
                        src={formData.logo}
                        alt="URL Preview"
                        width={192} // Example width
                        height={192} // Example height
                        className="w-48 h-48 object-cover rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Current Logo Display */}
                {formData.logo && formData.logoPublicId && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* <img
                          src={formData.logo}
                          alt="Uploaded Logo"
                          className="w-16 h-16 object-cover rounded-lg border"
                        /> */}

                        <Image
                          src={formData.logo}
                          alt="Uploaded Logo"
                          width={192} // Example width
                        height={192} // Example height
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <div>
                          <p className="text-sm font-medium text-green-900">
                            Logo uploaded successfully
                          </p>
                          <p className="text-xs text-green-600">
                            Stored in Cloudinary
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isSubmitting || isUploading}
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading || !formData.logo}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Company</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
