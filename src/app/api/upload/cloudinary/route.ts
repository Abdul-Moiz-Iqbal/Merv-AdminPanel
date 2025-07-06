// // pages/api/upload/cloudinary.ts (or app/api/upload/cloudinary/route.ts for App Router)
// import { NextRequest, NextResponse } from 'next/server';
// import { uploadToCloudinary, deleteFromCloudinary } from '@/utils/cloudinary';

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get('file') as File;
//     console.log(file)
//     const folder = formData.get('folder') as string || 'companies';

//     if (!file) {
//       return NextResponse.json(
//         { error: 'No file provided' },
//         { status: 400 }
//       );
//     }

//     // Validate file type (only images)
//     if (!file.type.startsWith('image/')) {
//       return NextResponse.json(
//         { error: 'Only image files are allowed' },
//         { status: 400 }
//       );
//     }

//     // Validate file size (max 10MB)
//     if (file.size > 10 * 1024 * 1024) {
//       return NextResponse.json(
//         { error: 'File size must be less than 10MB' },
//         { status: 400 }
//       );
//     }

//     // Convert file to buffer
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     // Upload to Cloudinary
//     const result = await uploadToCloudinary(buffer, {
//       folder,
//       transformation: {
//         width: 500,
//         height: 500,
//         crop: 'fill',
//         quality: 'auto',
//       },
//     });

//     return NextResponse.json({
//       message: 'Upload successful',
//       data: result,
//     });
//   } catch (error) {
//     console.error('Upload error:', error);
//     return NextResponse.json(
//       { error: 'Upload failed' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const publicId = searchParams.get('publicId');

//     if (!publicId) {
//       return NextResponse.json(
//         { error: 'Public ID is required' },
//         { status: 400 }
//       );
//     }

//     const result = await deleteFromCloudinary(publicId);

//     return NextResponse.json({
//       message: 'Delete successful',
//       data: result,
//     });
//   } catch (error) {
//     console.error('Delete error:', error);
//     return NextResponse.json(
//       { error: 'Delete failed' },
//       { status: 500 }
//     );
//   }
// }

// app/api/upload/cloudinary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    console.log(file);
    const folder = (formData.get("folder") as string) || "companies";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (only images)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer and then to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary using base64 data URI
    const result = await uploadToCloudinary(dataURI, {
      folder,
      transformation: {
        width: 500,
        height: 500,
        crop: "fill",
        quality: "auto",
      },
    });

      return NextResponse.json(
  {
    message: "Uploaded successful",
    data: result,
  },
  {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // or your frontend origin
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  }
);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteFromCloudinary(publicId);

    // return NextResponse.json({
    //   message: "Delete successful",
    //   data: result,
    // });
    return NextResponse.json(
  {
    message: "Delete successful",
    data: result,
  },
  {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // or your frontend origin
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  }
);
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
