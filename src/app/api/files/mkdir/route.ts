import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3";

export async function POST(request: Request) {
  try {
    const { path, folderName } = await request.json();

    if (!path || !folderName) {
      return NextResponse.json({ error: "Missing path or folderName" }, { status: 400 });
    }

    // Folders in S3 are just zero-byte objects with a trailing slash
    const key = `${path}${folderName}/`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: "",
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
