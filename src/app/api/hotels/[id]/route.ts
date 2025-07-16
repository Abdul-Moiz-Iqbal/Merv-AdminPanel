// app/api/hotels/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB  from '@/lib/mongoose';
import Hotel from '@/models/Hotel';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid hotel ID' },
        { status: 400 }
      );
    }

    const hotel = await Hotel.findById(params.id).lean();
    
    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: hotel
    });
  } catch (error: any) {
    console.error('Error fetching hotel:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid hotel ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate price range if provided
    if (body.priceRange && body.priceRange.min > body.priceRange.max) {
      return NextResponse.json(
        { success: false, error: 'Minimum price cannot be greater than maximum price' },
        { status: 400 }
      );
    }

    const hotel = await Hotel.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();

    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: hotel
    });
  } catch (error: any) {
    console.error('Error updating hotel:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid hotel ID' },
        { status: 400 }
      );
    }

    const hotel = await Hotel.findByIdAndDelete(params.id).lean();
    
    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting hotel:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}