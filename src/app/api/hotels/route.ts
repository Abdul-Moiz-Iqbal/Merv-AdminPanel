// app/api/hotels/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Hotel from "@/models/Hotel";
import { corsHeaders, handleCors } from "@/lib/cors";

// Handle OPTIONS method (preflight CORS check)
export async function OPTIONS(request: NextRequest) {
  return handleCors(request)!;
}

export async function GET(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const isActive = searchParams.get("isActive");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    let filter: any = {};

    if (city) {
      filter.city = city;
    }

    if (isActive !== null) {
      filter.isActive = isActive === "true";
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const hotels = await Hotel.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Hotel.countDocuments(filter);

    return NextResponse.json(
      {
        success: true,
        data: {
          hotels,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
          },
        },
      },
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error: any) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "city",
      "location",
      "priceRange",
      "rating",
      "image",
      "description",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate price range
    if (body.priceRange.min > body.priceRange.max) {
      return NextResponse.json(
        {
          success: false,
          error: "Minimum price cannot be greater than maximum price",
        },
        { status: 400 }
      );
    }

    const hotel = new Hotel(body);
    await hotel.save();

    return NextResponse.json(
      {
        success: true,
        data: hotel,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating hotel:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { success: false, error: validationErrors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
