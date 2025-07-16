import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import FindRequest from "@/models/FindRequest";
import { corsHeaders, handleCors } from "@/lib/cors";

// Handle OPTIONS method (preflight CORS check)
export async function OPTIONS(request: NextRequest) {
  return handleCors(request)!;
}

export async function GET(request: NextRequest) {
  // // Check if CORS preflight needs to respond
  // const cors = handleCors(request);
  // if (cors) return cors;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let filter: any = {};

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const requests = await FindRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await FindRequest.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: {
        requests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// export async function POST(request: NextRequest) {
//   try {
//     await connectDB();

//     const body = await request.json();

//     console.log(body);
//     const { email, product, quantity, targetCountry } = body;

//     if (!email || !product || !quantity || !targetCountry) {
//       return NextResponse.json(
//         { success: false, error: "All fields are required" },
//         { status: 400 }
//       );
//     }

//     const findRequest = new FindRequest({
//       email,
//       product,
//       quantity,
//       targetCountry,
//     });

//     await findRequest.save();

//     return NextResponse.json(
//       {
//         success: true,
//         data: findRequest,
//       },
//       { status: 201 }
//     );
//   } catch (error: any) {
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }

export async function POST(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    await connectDB();
    const body = await request.json();
    const { email, product, quantity, targetCountry } = body;

    if (!email || !product || !quantity || !targetCountry) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const findRequest = new FindRequest({ email, product, quantity, targetCountry });
    await findRequest.save();

    return new NextResponse(JSON.stringify({ success: true, data: findRequest }), {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}