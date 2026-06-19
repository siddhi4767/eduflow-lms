import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

export const uploadToS3 = async (
  fileStream: any,
  fileName: string,
  contentType: string,
  folder: string = "uploads"
): Promise<string> => {
  const uniqueFileName = `${folder}/${uuidv4()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const bucketName = process.env.S3_BUCKET_NAME || "eduflow-lms-assets";

  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: uniqueFileName,
        Body: fileStream,
        ContentType: contentType,
      },
    });

    await upload.done();
    // Return the public S3 URL
    return `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${uniqueFileName}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
};
