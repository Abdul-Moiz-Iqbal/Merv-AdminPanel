import { NextRequest, NextResponse } from 'next/server';
import  connectDB  from '@/lib/mongoose';
import FindRequest from '@/models/FindRequest';
import mongoose from 'mongoose';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['pending', 'responded'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const findRequest = await FindRequest.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!findRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: findRequest
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
