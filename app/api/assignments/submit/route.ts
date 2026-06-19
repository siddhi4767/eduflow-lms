import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
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
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;
    const userId = session.user.id as string;
    const isStudent = (user as any).role?.toUpperCase() === "STUDENT";

    // Since this can be multipart form data (for file uploads)
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const assignmentId = formData.get("assignmentId") as string;
      const textResponse = formData.get("textResponse") as string;
      const file = formData.get("file") as File | null;
      
      // If admin is grading, they might send studentId and score
      const studentId = formData.get("studentId") as string;
      const score = formData.get("score") as string;

      if (!isStudent && studentId && score) {
        // Admin grading an existing submission
        const updated = await prisma.assignmentSubmission.update({
          where: {
            assignmentId_userId: { assignmentId, userId: studentId }
          },
          data: {
            status: "Graded",
            score
          }
        });
        return NextResponse.json(updated);
      }

      if (!isStudent) {
        return NextResponse.json({ error: "Only students can submit." }, { status: 403 });
      }

      let fileUrl = null;

      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "eduflow-assignments" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        fileUrl = (uploadResult as any).secure_url;
      }

      const submission = await prisma.$transaction(async (tx) => {
        const sub = await tx.assignmentSubmission.upsert({
          where: {
            assignmentId_userId: {
              assignmentId,
              userId
            }
          },
          update: {
            status: "Submitted",
            fileUrl: fileUrl || undefined,
            textResponse: textResponse || undefined,
            submittedAt: new Date()
          },
          create: {
            assignmentId,
            userId,
            status: "Submitted",
            fileUrl,
            textResponse
          }
        });

        await tx.activity.create({
          data: {
            type: "assignment",
            message: `Assignment submitted`,
            icon: "✅",
          },
        });

        return sub;
      });

      return NextResponse.json(submission);
    } else {
      // JSON body (e.g. for grading without file upload)
      const body = await req.json();
      const { assignmentId, studentId, score } = body;

      if (isStudent) {
        return NextResponse.json({ error: "Students must use multipart form upload." }, { status: 400 });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const sub = await tx.assignmentSubmission.update({
          where: {
            assignmentId_userId: { assignmentId, userId: studentId }
          },
          data: {
            status: "Graded",
            score
          }
        });

        await tx.activity.create({
          data: {
            type: "assignment",
            message: `Assignment graded`,
            icon: "✅",
          },
        });

        return sub;
      });

      return NextResponse.json(updated);
    }
  } catch (error: any) {
    console.error("POST Assignment Submission Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
