import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return new NextResponse("Missing key", { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    // Convert Node.js Readable stream to Web stream
    const stream = response.Body?.transformToWebStream();
    
    if (!stream) {
      return new NextResponse("File body is empty", { status: 404 });
    }

    const filename = key.split("/").pop() || "download";

    return new NextResponse(stream, {
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return new NextResponse("Failed to download file", { status: 500 });
  }
}
