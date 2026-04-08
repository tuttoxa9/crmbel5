import { NextResponse } from "next/server";
import { DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3";

export async function DELETE(request: Request) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    // If it's a folder (ends with /), we need to delete all objects inside it
    if (key.endsWith("/")) {
      const listCmd = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: key,
      });
      const listResp = await s3Client.send(listCmd);
      
      if (listResp.Contents) {
        for (const item of listResp.Contents) {
          if (item.Key) {
            await s3Client.send(new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: item.Key
            }));
          }
        }
      }
    } else {
      // Single file deletion
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
      await s3Client.send(command);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
