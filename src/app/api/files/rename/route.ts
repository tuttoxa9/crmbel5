import { NextResponse } from "next/server";
import { CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3";

export async function POST(request: Request) {
  try {
    const { oldKey, newKey } = await request.json();

    if (!oldKey || !newKey) {
      return NextResponse.json({ error: "Missing keys" }, { status: 400 });
    }

    if (oldKey.endsWith("/")) {
      // It's a folder. We need to copy all items inside.
      const listCmd = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: oldKey,
      });
      const listResp = await s3Client.send(listCmd);
      
      if (listResp.Contents) {
        for (const item of listResp.Contents) {
          if (item.Key) {
            const relativePath = item.Key.substring(oldKey.length);
            const destinationKey = `${newKey}${relativePath}`;
            
            await s3Client.send(new CopyObjectCommand({
              Bucket: BUCKET_NAME,
              CopySource: `${BUCKET_NAME}/${item.Key}`,
              Key: destinationKey,
            }));
            
            await s3Client.send(new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: item.Key
            }));
          }
        }
      }
    } else {
      // Single file rename
      await s3Client.send(new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${oldKey}`,
        Key: newKey,
      }));

      await s3Client.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: oldKey,
      }));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error renaming file:", error);
    return NextResponse.json({ error: "Failed to rename file" }, { status: 500 });
  }
}
