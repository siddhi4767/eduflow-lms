import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../../../auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    console.log("Upload request received, user:", session?.user?.id);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      console.log("Upload failed: No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    console.log(`File detected: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    // Validate file type (only image types allowed)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("Attempting upload to Cloudinary...");
    // Upload to Cloudinary using a stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "eduflow-profiles" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const imageUrl = (uploadResult as any).secure_url;
    console.log("Upload successful, URL:", imageUrl);

    // Update user image in Prisma
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "student",
        message: `${updatedUser.name || updatedUser.email} updated their profile picture`,
        icon: "🖼️",
      },
    });

    console.log("Database update successful for user:", updatedUser.id);
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Profile Upload Error:", error);
    // Cloudinary throws objects that aren't instances of Error
    const message = error.message || (typeof error === "string" ? error : JSON.stringify(error));
    return NextResponse.json({ error: message || "Failed to upload file" }, { status: 500 });
  }
}
