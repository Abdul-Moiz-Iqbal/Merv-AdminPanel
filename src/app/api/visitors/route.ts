import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Visitor from "@/models/Visitors";
import crypto from "crypto";
import connectDB from "@/lib/mongoose";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Or specify domain: 'http://172.29.208.1:3001'
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

// POST: Track a new visitor
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const ip = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create a unique fingerprint
    const fingerprint = crypto
      .createHash("sha256")
      .update(ip + userAgent)
      .digest("hex");

    // Check if visitor already exists
    const existingVisitor = await Visitor.findOne({ fingerprint });

    if (!existingVisitor) {
      // Create new visitor record
      await Visitor.create({
        ip,
        userAgent,
        fingerprint,
      });
    }

    // Get total visitor count
    const totalVisitors = await Visitor.countDocuments();

    // return NextResponse.json({
    //   success: true,
    //   totalVisitors,
    //   isNewVisitor: !existingVisitor
    // });
    return new NextResponse(
      JSON.stringify({
        success: true,
        totalVisitors,
        isNewVisitor: !existingVisitor,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error tracking visitor:", error);
    // return NextResponse.json(
    //   { error: 'Failed to track visitor' },
    //   { status: 500 }
    // );
    return new NextResponse(
      JSON.stringify({ error: "Failed to track visitor" }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// GET: Get total visitor count
export async function GET() {
  try {
    await connectDB();

    const totalVisitors = await Visitor.countDocuments();

    // return NextResponse.json({
    //   success: true,
    //   totalVisitors
    // });

    return new NextResponse(JSON.stringify({ success: true, totalVisitors }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error getting visitor count:", error);
    // return NextResponse.json(
    //   { error: 'Failed to get visitor count' },
    //   { status: 500 }
    // );
    return new NextResponse(
      JSON.stringify({ error: "Failed to get visitor count" }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
