import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Visitor from '@/models/Visitors';
import connectDB from '@/lib/mongoose';



// ✅ Common CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // or restrict: 'http://your-html-site.com'
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ✅ Handle OPTIONS request (preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}


// GET: Get recent visitors
export async function GET() {
  try {
    await connectDB();
    
    // Get the most recent 50 visitors
    const recentVisitors = await Visitor
      .find()
      .sort({ visitedAt: -1 })
      .limit(50)
      .select('ip userAgent visitedAt')
      .lean();
    
    // return NextResponse.json({ 
    //   success: true, 
    //   visitors: recentVisitors 
    // });
     return new NextResponse(
      JSON.stringify({
        success: true,
        visitors: recentVisitors,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
    
  } catch (error) {
    console.error('Error getting recent visitors:', error);
    return NextResponse.json(
      { error: 'Failed to get recent visitors' }, 
      { status: 500 }
    );
  }
}